import easyocr
import argparse
import json

parser = argparse.ArgumentParser()

parser.add_argument("-p", "--path", nargs='+')
parser.add_argument("-s", "--search")
parser.add_argument("-f", "--folder")

args = parser.parse_args()

model_folder = args.folder if args.folder else "./ocr_data/model"

reader = easyocr.Reader(['ru','en'], model_storage_directory=model_folder , gpu=False) # this needs to run only once to load the model into memory
data = []

for path in args.path:
    results = reader.readtext(path)
    for result in results:
        if result[1].find(args.search) != -1:
            coords = result[0]
            confidence = result[2]
            data.append({"confidence": confidence, "coords": list(map(lambda i: list(map(lambda j: int(j), i)), coords))})

print("Output:")
print(json.dumps(data))