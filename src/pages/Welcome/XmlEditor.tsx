import { HvCodeEditor } from "@hitachivantara/uikit-react-code-editor";
import { useEffect, useRef, useState } from "react";
import { validateXML } from "xmllint-wasm";
import { parseSchema, xmlCompletionProvider } from "./utils";

export const xsdSchema = `
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">

<xs:element name="shiporder">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="orderperson" type="xs:string"/>
      <xs:element name="shipto">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="name" type="xs:string"/>
            <xs:element name="address" type="xs:string"/>
            <xs:element name="city" type="xs:string"/>
            <xs:element name="country" type="xs:string"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
      <xs:element name="item" maxOccurs="unbounded">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="title" type="xs:string"/>
            <xs:element name="note" type="xs:string" minOccurs="0"/>
            <xs:element name="quantity" type="xs:positiveInteger"/>
            <xs:element name="price" type="xs:decimal"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
    </xs:sequence>
    <xs:attribute name="orderid" type="xs:string" use="required"/>
  </xs:complexType>
</xs:element>

</xs:schema> 
`;

const initialXml = `<shiporder orderid="889923" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="shiporder.xsd">
  <orderperson>John Smith</orderperson>
  <shipto>
    <name>Ola Nordmann</name>
    <address>Langgt 23</address>
    <city>4000 Stavanger</city>
    <country>Norway</country>
  </shipto>
  <item>
    <title>Empire Burlesque</title>
    <note>Special Edition</note>
    <quantity>1</quantity>
    <price>10.90</price>
  </item>
  <item>
    <title>Hide your heart</title>
    <quantity>1</quantity>
    <price>9.90</price>
  </item>
</shiporder>`;

const XmlEditor = () => {
	const [xml, setXml] = useState<string | undefined>(initialXml);
	const [errors, setErrors] = useState<any[]>([]);
	const editorRef = useRef(null);
	const monacoRef = useRef(null);

	const elements = parseSchema(xsdSchema);

	const handleEditorChange = (value?: string) => {
		setXml(value);
		value && validationHandler(value);
	};

	const validationHandler = async (xmlString: string) => {
		const validationResult = await validateXML({
			xml: xmlString,
			schema: xsdSchema,
		})
			.then((res) => {
				console.log(res);
				if (!res.valid) {
					Array.isArray(res.errors) && setErrors(res.errors);
				} else {
					setErrors([]);
				}
			})
			.catch((error) => setErrors([error]));
	};

	const handleBeforeMount = (editor: any, monaco: any) => {
		editorRef.current = editor;
		monacoRef.current = monaco;
	};

	const handleEditorDidMount = (monaco: any) => {
		monaco.languages.register({ id: "xml" });
		monaco.languages.registerCompletionItemProvider("xml", {
			triggerCharacters: ["<", " "],
			provideCompletionItems: (model: any, position: any) =>
				xmlCompletionProvider(monaco, model, position, elements),
		});
	};

	useEffect(() => {
		if (editorRef.current && monacoRef.current) {
			const model = editorRef.current.getModel(); // Get the editor model

			if (model) {
				const markers = errors.map((error) => {
					console.log(error);
					const line = parseInt(error.line, 10) || 1; // Default to line 1 if not available
					const column = parseInt(error.column, 10) || 1; // Default to column 1 if not available

					return {
						startLineNumber: line,
						startColumn: column,
						endLineNumber: line,
						endColumn: column + 1,
						message: error.message,
						severity: monacoRef.current?.MarkerSeverity.Error,
					};
				});
				monacoRef.current.editor.setModelMarkers(model, "xml", markers);
			}
		}
	}, [errors, setErrors]);

	return (
		<>
			{errors.length > 0 && (
				<div className="error">
					{errors.map((error, index) => (
						<div key={index}>{error.message}</div>
					))}
				</div>
			)}
			<div style={{ width: "100%", paddingTop: 50 }}>
				<HvCodeEditor
					height="70vh"
					width="50wh"
					language="xml"
					value={xml}
					beforeMount={(monaco) => handleEditorDidMount(monaco)}
					onMount={(editor, monaco) => handleBeforeMount(editor, monaco)}
					onChange={(value, event) => handleEditorChange(value)}
				/>
			</div>
		</>
	);
};

export default XmlEditor;
