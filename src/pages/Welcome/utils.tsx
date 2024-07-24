import { XMLParser } from "fast-xml-parser";

export const xmlCompletionProvider = (
	monaco: any,
	model: any,
	position: any,
	elements: any[]
) => {
	return {
		suggestions: elements.map((elem) => ({
			label: elem,
			kind: monaco.languages.CompletionItemKind.Text,
			insertText: `<${elem}></${elem}>`,
		})),
	};
};

const extractElements = (obj: any, elements = new Set()) => {
	console.log("Extracting from:", obj); // Debugging: log the current object being processed

	if (obj["xs:element"]) {
		if (Array.isArray(obj["xs:element"])) {
			obj["xs:element"].forEach((el) => {
				elements.add(el["@_name"]);
				// console.log("Added element (array):", el["@_name"]); // Debugging: log the element name added
				if (el["xs:complexType"] && el["xs:complexType"]["xs:sequence"]) {
					extractElements(el["xs:complexType"]["xs:sequence"], elements);
				}
			});
		} else {
			elements.add(obj["xs:element"]["@_name"]);
			// console.log("Added element (single):", obj["xs:element"]["@_name"]); // Debugging: log the element name added
			if (
				obj["xs:element"]["xs:complexType"] &&
				obj["xs:element"]["xs:complexType"]["xs:sequence"]
			) {
				extractElements(
					obj["xs:element"]["xs:complexType"]["xs:sequence"],
					elements
				);
			}
		}
	}

	if (obj["xs:sequence"]) {
		if (Array.isArray(obj["xs:sequence"])) {
			obj["xs:sequence"].forEach((seq) => extractElements(seq, elements));
		} else {
			extractElements(obj["xs:sequence"], elements);
		}
	}

	return elements;
};

export const parseSchema = (schema: string) => {
	const parser = new XMLParser({ ignoreAttributes: false });
	const parsed = parser.parse(schema);
	const elements = extractElements(parsed["xs:schema"]);
	return Array.from(elements);
};
