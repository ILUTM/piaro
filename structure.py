import os

def list_directory_structure(root_dir, ignore_list=None, indent_level=0):

    items = os.listdir(root_dir)

    for item in items:
        if item in ignore_list:
            continue

        item_path = os.path.join(root_dir, item)
        indent = '  ' * indent_level

        if os.path.isdir(item_path):
            print(f"{indent}- {item}/")
            list_directory_structure(item_path, ignore_list, indent_level + 1)
        else:
            print(f"{indent}- {item}")

if __name__ == "__main__":
    root_directory = "D:/piaro/" 
    ignore = ["__pycache__", ".git", "node_modules", 'venv']  
    list_directory_structure(root_directory, ignore)
