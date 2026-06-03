import pymssql
import pymysql
import sys

# Configurations
MSSQL_HOST = 'madredeus-db-legacy'
MSSQL_USER = 'sa'
MSSQL_PASS = 'YourStrong@Pass123'
MSSQL_DB = 'InstitutoTerciarioV2'

# Inside Docker Compose bridge network, MySQL is reachable via host name 'db'
MYSQL_HOST = 'db'
MYSQL_USER = 'root'
MYSQL_PASS = 'secret'
MYSQL_DB = 'madredeus_legacy'

print("Conectando a SQL Server (Contenedor Temporal)...")
try:
    mssql_conn = pymssql.connect(server=MSSQL_HOST, user=MSSQL_USER, password=MSSQL_PASS, database=MSSQL_DB)
    mssql_cursor = mssql_conn.cursor()
    print("  ¡Conectado exitosamente a SQL Server!")
except Exception as e:
    print(f"Error al conectar a SQL Server: {e}")
    sys.exit(1)

print("Conectando a MySQL (Contenedor Actual)...")
try:
    mysql_conn = pymysql.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASS, database=MYSQL_DB, autocommit=True)
    mysql_cursor = mysql_conn.cursor()
    print("  ¡Conectado exitosamente a MySQL!")
except Exception as e:
    print(f"Error al conectar a MySQL: {e}")
    sys.exit(1)

# Listar todas las tablas definidas por el usuario
mssql_cursor.execute("SELECT name FROM sys.tables WHERE is_ms_shipped = 0 AND name != 'sysdiagrams' ORDER BY name")
tables = [row[0] for row in mssql_cursor.fetchall()]
print(f"\nSe encontraron {len(tables)} tablas para migrar.")

def map_type(mssql_type, length, precision, scale):
    mssql_type = mssql_type.lower()
    if mssql_type in ['int', 'bigint', 'smallint', 'tinyint']:
        return 'INT' if mssql_type != 'tinyint' else 'TINYINT'
    elif mssql_type in ['bit']:
        return 'TINYINT'
    elif mssql_type in ['varchar', 'nvarchar', 'char', 'nchar']:
        if length == -1 or length > 4000:
            return 'TEXT'
        # pymssql retorna el tamaño en bytes, para nvarchar es el doble de caracteres
        char_len = max(length, 255)
        # Si es nvarchar o nchar, dividimos por 2 para obtener el numero de caracteres aproximado
        if mssql_type.startswith('n'):
            char_len = max(int(length / 2), 255)
        return f"VARCHAR({char_len})"
    elif mssql_type in ['text', 'ntext']:
        return 'TEXT'
    elif mssql_type in ['datetime', 'smalldatetime', 'date', 'time']:
        return 'DATETIME'
    elif mssql_type in ['decimal', 'numeric']:
        return f"DECIMAL({precision or 18}, {scale or 2})"
    elif mssql_type in ['float', 'real']:
        return 'DOUBLE'
    elif mssql_type in ['uniqueidentifier']:
        return 'VARCHAR(36)'
    elif mssql_type in ['varbinary', 'binary', 'image']:
        return 'LONGBLOB'
    else:
        return 'TEXT'

print("\nIniciando migración de tablas crudas...")
for table in tables:
    print(f"-> Migrando tabla: {table}...")
    
    # Obtener columnas y tipos de datos en SQL Server
    mssql_cursor.execute(f"""
        SELECT c.name, t.name AS type, c.max_length, c.precision, c.scale, c.is_nullable
        FROM sys.columns c
        JOIN sys.types t ON c.user_type_id = t.user_type_id
        WHERE c.object_id = OBJECT_ID('{table}')
        ORDER BY c.column_id
    """)
    cols_data = mssql_cursor.fetchall()
    
    columns = []
    col_names = []
    for col in cols_data:
        name = col[0]
        col_type = col[1]
        length = col[2]
        precision = col[3]
        scale = col[4]
        is_nullable = col[5]
        
        mysql_type = map_type(col_type, length, precision, scale)
        null_str = "NULL" if is_nullable else "NOT NULL"
        columns.append(f"`{name}` {mysql_type} {null_str}")
        col_names.append(name)
        
    # Eliminar la tabla en MySQL si ya existía para permitir re-ejecución limpia
    mysql_cursor.execute(f"DROP TABLE IF EXISTS `{table}`")
    
    # Crear la tabla en la base de datos de staging en MySQL
    create_sql = f"CREATE TABLE `{table}` (\n  " + ",\n  ".join(columns) + "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    mysql_cursor.execute(create_sql)
    
    # Obtener todas las filas de SQL Server
    mssql_cursor.execute(f"SELECT * FROM [{table}]")
    rows = mssql_cursor.fetchall()
    
    if not rows:
        print(f"   [Aviso] La tabla {table} está vacía.")
        continue
        
    # Insertar filas en MySQL en lotes (batches)
    placeholders = ", ".join(["%s"] * len(col_names))
    insert_sql = f"INSERT INTO `{table}` (" + ", ".join([f"`{c}`" for c in col_names]) + f") VALUES ({placeholders})"
    
    # Limpiar y preparar filas (conversión de tipos especiales a string/null)
    cleaned_rows = []
    for row in rows:
        cleaned_row = []
        for val in row:
            # Reemplazar valores nulos o vacíos en tipos binarios/GUID si fuese necesario
            cleaned_row.append(val)
        cleaned_rows.append(tuple(cleaned_row))
        
    batch_size = 1000
    for i in range(0, len(cleaned_rows), batch_size):
        batch = cleaned_rows[i:i+batch_size]
        mysql_cursor.executemany(insert_sql, batch)
        
    print(f"   ✓ ¡Éxito! {len(cleaned_rows)} filas copiadas a la tabla `{table}`.")

# Cerrar conexiones
mssql_conn.close()
mysql_conn.close()

print("\n¡PROCESO COMPLETADO EXITOSAMENTE!")
print("Todas las tablas crudas históricas han sido migradas a la base de datos de MySQL 'madredeus_legacy'.")
