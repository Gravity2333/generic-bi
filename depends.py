import os
import sys
import json

if not os.path.exists('package.json'):
    os.system("npm init -y")

with open('package.json', 'r') as file:
    data = json.load(file)

if 'dependencies' not in data:
    data['dependencies'] = {}
if 'devDependencies' not in data:
    data['devDependencies'] = {}

for file in sys.argv[1:]:
    with open(file, 'r') as f:
        d = json.load(f)

    data['dependencies'].update(d['dependencies'])
    data['devDependencies'].update(d['devDependencies'])

if '@bi/common' in data['dependencies']:
    del data['dependencies']['@bi/common']
if '@bi/common' in data['devDependencies']:
    del data['devDependencies']['@bi/common']

with open('package.json', 'w') as file:
    json.dump(data, file, indent=2)

