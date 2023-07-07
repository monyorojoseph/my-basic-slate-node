import { useCallback, useState } from 'react'
import { createEditor, BaseEditor, Descendant,
     Transforms, Editor, Element as SlateElement, Text as SlateText   } from 'slate'
import { Slate, Editable, withReact, useSlate, RenderElementProps, RenderLeafProps } from 'slate-react'
import { BsCode, BsListOl, BsListUl, BsTypeBold, BsTypeItalic, BsTypeUnderline } from 'react-icons/bs'
import { BiHeading } from 'react-icons/bi'

type ElementProps = {
    attributes: RenderElementProps['attributes'];
    children: RenderElementProps['children'];
    element: SlateElement;
  };

type LeafProps = {
    attributes: RenderLeafProps['attributes'];
    children: RenderLeafProps['children'];
    leaf: SlateText;
  };

type CustomElement = SlateElement & {
    type: string;
    // Add any other custom properties specific to your element
  };
  
const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const SlateNode = ({initialValue, readOnly}:{initialValue:  Descendant[], readOnly: boolean})=> {
    const [editor] = useState(() => withReact(createEditor()))
    const renderElement = useCallback((props: ElementProps) => <Element {...props}/>, [])
    const renderLeaf = useCallback((props: LeafProps) => <Leaf {...props} />, [])
    
    if (readOnly){
        return (
            <div className='w-full'>
                <Slate 
                    editor={editor}
                    initialValue={initialValue}>
                        <Editable
                            className='h-full w-full p-3 outline-none'
                            renderElement={renderElement}
                            renderLeaf={renderLeaf}
                            readOnly
                        />
                </Slate>
            </div> 
            )       
    }

    return (
        <div className='border rounded-sm w-full'>
            <Slate 
                editor={editor}
                initialValue={initialValue}>
                    <ToolBar />
                    <Editable
                        style={{minHeight: "20vh"}}
                        className='h-full w-full p-3 outline-none'
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        placeholder="Enter text…"
                        spellCheck
                        autoFocus
                    />
            </Slate>

        </div>
    )
}

export default SlateNode;

const ToolBar = ()=> {
    const editor = useSlate()
    return(
        <div 
        style={{minHeight: "5vh"}}
        className='border-b px-3 w-full flex flex-col justify-center'>
            <div className='flex flex-row justify-start items-center'>
                <MarkButton 
                active={isMarkActive(editor, 'bold')} 
                format={'bold'}
                editor={editor}>
                    <BsTypeBold />
                </MarkButton>

                <MarkButton 
                active={isMarkActive(editor, 'italic')} 
                format={'italic'}
                editor={editor}>
                    <BsTypeItalic />
                </MarkButton>

                <MarkButton 
                active={isMarkActive(editor, 'underline')} 
                format={'underline'}
                editor={editor}>
                    <BsTypeUnderline />
                </MarkButton>

                <MarkButton 
                active={isMarkActive(editor, 'code')} 
                format={'code'}
                editor={editor}>
                    <BsCode />
                </MarkButton>

                <BlockButton 
                active={isBlockActive(editor, 'heading')} 
                format={'heading'}
                editor={editor}>
                    <BiHeading />
                </BlockButton>

                <BlockButton 
                active={isBlockActive(editor, 'numbered-list')} 
                format={'numbered-list'}
                editor={editor}>
                    <BsListOl />
                </BlockButton>

                <BlockButton 
                active={isBlockActive(editor, 'bulleted-list')} 
                format={'bulleted-list'}
                editor={editor}>
                    <BsListUl />
                </BlockButton>
            </div>
        </div>
    )
}

const MarkButton = ({children, active, editor, format}:
    {children: JSX.Element, active:boolean, editor: BaseEditor, format: string})=>{
    return(
        <span
        className={`px-2 py-0.5 text-black cursor-pointer ${active ? "text-opacity-100" : "text-opacity-50"}`}
        onMouseDown={(event)=> {
            event.preventDefault();
            toggleMark(editor, format)
        }}>
            {children}            
        </span>
    )
}
const BlockButton = ({children, active, editor, format}:
    {children: JSX.Element, active:boolean, editor: BaseEditor, format: string})=>{
    return(
        <span
        className={`px-2 py-0.5 text-black cursor-pointer ${active ? "text-opacity-100" : "text-opacity-50"}`}
        onMouseDown={(event)=> {
            event.preventDefault();
            toggleBlock(editor, format)
        }}>
            {children}            
        </span>
    )
}

const Element = ({ attributes, children, element }: ElementProps)=> {
    const style = {}
    switch (element.type) {
        case 'bulleted-list':
            return (
              <ul style={style} {...attributes}
                className='px-5 list-disc'>
                {children}
              </ul>
            )
        case 'heading':
            return (
                <h1 style={style} {...attributes}
                className='text-lg font-semibold'>
                {children}
                </h1>
            )
        case 'list-item':
            return (
                <li style={style} {...attributes}>
                {children}
                </li>
            )
        case 'numbered-list':
            return (
                <ol style={style} {...attributes}
                className='px-5 list-decimal'>
                {children}
                </ol>
            )
        default:
            return (
                <p style={style} {...attributes}>
                {children}
                </p>
            )
      }
}

const Leaf = ({ attributes, children, leaf }: LeafProps)=> {
    if (leaf.bold) {
        children = <strong>{children}</strong>
      }
    
    if (leaf.code) {
        children = <code 
        className='px-3 py-1.5 bg-black bg-opacity-5 mx-1.5'>
            {children}</code>
      }
    
    if (leaf.italic) {
        children = <em>{children}</em>
      }
    
    if (leaf.underline) {
        children = <u>{children}</u>
      }
    
      return <span {...attributes}>{children}</span>
}

const isBlockActive = (editor: BaseEditor, format: string,)=> {
    const { selection } = editor;
    if (!selection) return false;
    const [match] = Array.from(
        Editor.nodes(editor,{
            at: Editor.unhangRange(editor, selection),
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n['type'] === format
        })
    );
    return !!match;
}

const isMarkActive = ( editor: BaseEditor, format: string)=> {
    const marks =  Editor.marks(editor);
    return marks ? marks[format] === true : false;
}

const toggleMark = (editor: BaseEditor, format: string)=> {
    const isActive = isMarkActive(editor, format);
    if (isActive){
        Editor.removeMark(editor, format);
    }else{
        Editor.addMark(editor, format, true);
    }
}

const toggleBlock = (editor:BaseEditor, format: string)=> {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
        split: true
    })
    let newProperties: Partial<CustomElement>
    newProperties = {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
      }

    Transforms.setNodes<CustomElement>(editor, newProperties)

    if (!isActive && isList) {
        const block = { type: format, children: [] }
        Transforms.wrapNodes(editor, block)
    }
}