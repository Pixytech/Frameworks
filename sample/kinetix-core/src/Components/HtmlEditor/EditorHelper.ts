import { EditorState } from "prosemirror-state";
import { Mark,Node } from "prosemirror-model";
import { uniqBy } from "lodash";
import { debounceTime, Subject } from "rxjs";
import { ProseMirror } from "@progress/kendo-react-editor";
const { PluginKey } = ProseMirror;


export class EditorPlugin extends ProseMirror.Plugin<any> implements IEditorPlugin {
  
  
}

export type IEditorPlugin  = EditorPlugin;

export class EditorHelper {
  public static getActiveMarks(state: EditorState,pos?: number): Mark[] {
    const resolvedPos = state.doc.resolve(pos ??  state.selection.from);
    const marks = resolvedPos? [...(resolvedPos.marks()),...(resolvedPos.marksAcross(resolvedPos) || [])]:[];
    const result  = uniqBy(marks, (mark: Mark) => mark.type.name);
    console.debug("Active Marks", result,pos  );
    return result;
  }
}

export interface ClickEvent{
  state: EditorState, 
  pos: number, 
  node: Node, 
  nodePos: number,
  event: MouseEvent, 
  direct: boolean
}

export const OnClickPlugin = (key: string, 
  handler: (e:ClickEvent) => void,
  immediateHandler:  (e:ClickEvent) => void = () => {},
  canHandle:(e:ClickEvent) => boolean = ()=>true
  ):IEditorPlugin => {
  const listener = new Subject<ClickEvent>();
  listener.pipe(debounceTime(200)).subscribe((e) => {
    handler(e)
  });

  return new EditorPlugin({
    key: new PluginKey(key),
    props: {
      handleClickOn: (view: any, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean) => {
        const e:ClickEvent = {
          state : view.state,
          pos:pos,
          node:node,
          nodePos:nodePos,
          event:event,
          direct:direct
        }
        if(canHandle(e)){
          if (immediateHandler) {
            immediateHandler(e);
          }

          listener.next(e);
          return true;
        }
        e.event.preventDefault();
        return false;
      },
    },
  })  
}