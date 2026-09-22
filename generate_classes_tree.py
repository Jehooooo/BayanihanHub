import os
import re

IGNORED_DIRS = {'.git', 'node_modules', 'venv', '.venv', '__pycache__', 'dist', 'build', 'public', 'assets', '.next', '.vscode'}

def get_classes_in_file(filepath):
    classes = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                # Python classes
                m = re.match(r'^\s*class\s+([A-Za-z0-9_]+)', line)
                if m:
                    classes.append(m.group(1))
                else:
                    # TS/JS classes
                    m = re.match(r'^\s*(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)', line)
                    if m:
                        classes.append(m.group(1))
    except Exception:
        pass
    # Remove duplicates but keep order
    seen = set()
    return [x for x in classes if not (x in seen or seen.add(x))]

def build_tree(root_dir):
    tree = {}
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # modify dirnames in-place to skip ignored directories
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS and not d.startswith('.')]
        
        for filename in filenames:
            if not filename.endswith(('.py', '.ts', '.tsx', '.js', '.jsx')):
                continue
                
            filepath = os.path.join(dirpath, filename)
            classes = get_classes_in_file(filepath)
            
            if classes:
                rel_path = os.path.relpath(filepath, root_dir)
                parts = rel_path.split(os.sep)
                
                curr = tree
                for part in parts[:-1]:
                    if part not in curr:
                        curr[part] = {}
                    curr = curr[part]
                
                curr[parts[-1]] = classes
    return tree

def print_tree(tree, f, prefix=''):
    keys = sorted(list(tree.keys()))
    for i, key in enumerate(keys):
        is_last = (i == len(keys) - 1)
        connector = '└── ' if is_last else '├── '
        
        if isinstance(tree[key], dict):
            f.write(f"{prefix}{connector}📁{key}\n")
            new_prefix = prefix + ('    ' if is_last else '│   ')
            print_tree(tree[key], f, new_prefix)
        else:
            f.write(f"{prefix}{connector}{key}\n")
            classes = tree[key]
            new_prefix = prefix + ('    ' if is_last else '│   ')
            for j, cls in enumerate(classes):
                c_is_last = (j == len(classes) - 1)
                c_connector = '└── ' if c_is_last else '├── '
                f.write(f"{new_prefix}{c_connector}Class: {cls}\n")

if __name__ == '__main__':
    tree = build_tree('.')
    with open('CLASSES_STRUCTURE.md', 'w', encoding='utf-8') as f:
        f.write("```text\n")
        f.write("└── 📁BayanihanHubAfter\n")
        print_tree(tree, f, '    ')
        f.write("```\n")
