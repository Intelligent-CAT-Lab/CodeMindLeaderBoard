import json

def merge_subkeys(data):
    for main_key, sub_data in data.items():
        # Initialize new subkeys if they don't exist
        if 'CodeNet' not in sub_data:
            sub_data['CodeNet'] = {}
        if 'Avatar' not in sub_data:
            sub_data['Avatar'] = {}

        # Process each relevant subkey
        for subkey in ['CodeNet_Python', 'CodeNet_Java', 'Avatar_Python', 'Avatar_Java']:
            if subkey in sub_data:
                target_key = 'CodeNet' if 'CodeNet' in subkey else 'Avatar'
                language = subkey.split('_')[1]  # Extract the language from the subkey
                # Merge entries
                for id, entry in sub_data[subkey].items():
                    entry["programming_language"] = language
                    if id not in sub_data[target_key]:
                        sub_data[target_key][id] = []
                    sub_data[target_key][id].append(entry)
                # Remove the old key
                del sub_data[subkey]

# Load the JSON data
with open('ier_data.json', 'r') as file:
    data = json.load(file)

merge_subkeys(data)

# Save the modified data back to 'ier_data.json'
with open('ier_data.json', 'w') as file:
    json.dump(data, file, indent=4)


# Load the JSON data
with open('dataset.json', 'r') as file:
    data = json.load(file)

# Initialize the combined "CodeNet" and "Avatar" keys if not present
if "CodeNet" not in data:
    data["CodeNet"] = {}

if "Avatar" not in data:
    data["Avatar"] = {}

for key in list(data.keys()):
    if key.startswith("CodeNet_"):
        _, language = key.split("_")
        
        for record_id, record in data[key].items():
            # Add the programming language to the record
            record["programming_language"] = language
            
            # Add this record to the "CodeNet" key
            if record_id not in data["CodeNet"]:
                data["CodeNet"][record_id] = []
            data["CodeNet"][record_id].append(record)

        # Delete the processed "CodeNet_" keys
        del data[key]

    if key.startswith("Avatar_"):
        _, language = key.split("_")
        
        for record_id, record in data[key].items():
            # Add the programming language to the record
            record["programming_language"] = language
            
            # Add this record to the "Avatar" key
            if record_id not in data["Avatar"]:
                data["Avatar"][record_id] = []
            data["Avatar"][record_id].append(record)

        # Delete the processed "Avatar_" keys
        del data[key]

# Save the modified dataset back to the original file
with open('dataset.json', 'w') as file:
    json.dump(data, file, indent=4)
