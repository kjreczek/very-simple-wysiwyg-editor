const saveButton = document.getElementById("save");
const loadInput = document.getElementById("read");
const editor = document.getElementById("editor");

const TYPE_FIELD = "type";
const CONTENT_FIELD = "content";

function downloadToFile(content, filename, contentType) {
  const fakeAnchor = document.createElement("a");
  const file = new Blob([content], { type: contentType });

  fakeAnchor.href = URL.createObjectURL(file);
  fakeAnchor.download = filename;
  fakeAnchor.click();

  URL.revokeObjectURL(fakeAnchor.href);
}

function objectToHTMLString(object) {
  let result = "";
  result += "<" + object[TYPE_FIELD] + ">";
  object[CONTENT_FIELD].forEach((node) => {
    if (typeof node === "string") {
      result += node;
    } else {
      result += objectToHTMLString(node);
    }
  });

  result += "</" + object[TYPE_FIELD] + ">";
  return result;
}

function treeifyDOMObject(element) {
  const tree = {};
  tree[TYPE_FIELD] = element.nodeName;
  const nodeList = element.childNodes;

  if (nodeList && nodeList.length) {
    tree[CONTENT_FIELD] = [];

    nodeList.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        tree[CONTENT_FIELD].push(node.nodeValue);
      } else {
        const subTree = treeifyDOMObject(node);
        tree[CONTENT_FIELD].push(subTree);
      }
    });
  }

  return tree;
}

function parseEditorContentIntoJSONFile() {
  const editor = document.getElementById("editor");
  const contentSingleElementString = "<div>" + editor.innerHTML + "</div>";
  const documentObject = new DOMParser().parseFromString(
    contentSingleElementString,
    "text/html"
  );
  const contentSingleElementObject = treeifyDOMObject(
    documentObject.body.firstChild
  );

  const json = JSON.stringify(contentSingleElementObject);
  downloadToFile(json, "new-file.json", "application/json");
}

function formatText(command, value) {
  document.execCommand(command, false, value);
}

saveButton.addEventListener("click", parseEditorContentIntoJSONFile);

loadInput.addEventListener("change", function () {
  if (this.files && this.files[0]) {
    var myFile = this.files[0];
    var reader = new FileReader();

    reader.addEventListener("load", function (e) {
      const object = JSON.parse(e.target.result);
      editor.innerHTML = objectToHTMLString(object);
    });

    reader.readAsBinaryString(myFile);
  }
});
