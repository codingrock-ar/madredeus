import os
import re

directory = 'backend/public/js/components'

def replace_func(match):
    quote = match.group(1)
    return f"fetch(window.API_BASE + {quote}/api"

# Pattern to match fetch('/api, fetch("/api, fetch(`/api
pattern = re.compile(r"fetch\((['\"`])/api")

for filename in os.listdir(directory):
    if filename.endswith('.js'):
        path = os.path.join(directory, filename)
        with open(path, 'r') as f:
            content = f.read()
        
        new_content = pattern.sub(replace_func, content)
        
        if content != new_content:
            with open(path, 'w') as f:
                f.write(new_content)
            print(f"Updated {filename}")
