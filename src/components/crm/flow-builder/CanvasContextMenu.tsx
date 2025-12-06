import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import { 
  Copy, Scissors, ClipboardPaste, Trash2, 
  Group, Ungroup, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter,
  Plus, MousePointer2, Pencil, Layers
} from 'lucide-react';

interface ContextMenuAction {
  onCopy: () => void;
  onCut: () => void;
  onPaste: (position: { x: number; y: number }) => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onDuplicate: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onAlignHorizontal: () => void;
  onAlignVertical: () => void;
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  onEdit: () => void;
}

interface CanvasContextMenuProps {
  children: React.ReactNode;
  position: { x: number; y: number };
  context: 'canvas' | 'single-node' | 'multi-node' | 'group';
  selectedCount: number;
  canPaste: boolean;
  hasGroup: boolean;
  actions: ContextMenuAction;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  children,
  position,
  context,
  selectedCount,
  canPaste,
  hasGroup,
  actions
}) => {
  const quickNodeTypes = [
    { type: 'api_trigger', label: 'API Trigger' },
    { type: 'ai_conversation', label: 'AI Conversation' },
    { type: 'conditional', label: 'Conditional Router' },
    { type: 'sms_message', label: 'Send SMS' },
    { type: 'email_action', label: 'Send Email' },
  ];

  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="w-56">
        {/* Canvas Context */}
        {context === 'canvas' && (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                {quickNodeTypes.map(node => (
                  <ContextMenuItem 
                    key={node.type}
                    onClick={() => actions.onAddNode(node.type, position)}
                  >
                    {node.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => actions.onPaste(position)} disabled={!canPaste}>
              <ClipboardPaste className="w-4 h-4 mr-2" />
              Paste
              <ContextMenuShortcut>⌘V</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={actions.onSelectAll}>
              <MousePointer2 className="w-4 h-4 mr-2" />
              Select All
              <ContextMenuShortcut>⌘A</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}

        {/* Single Node Context */}
        {context === 'single-node' && (
          <>
            <ContextMenuItem onClick={actions.onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Node
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={actions.onCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={actions.onCut}>
              <Scissors className="w-4 h-4 mr-2" />
              Cut
              <ContextMenuShortcut>⌘X</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={actions.onDuplicate}>
              <Layers className="w-4 h-4 mr-2" />
              Duplicate
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem 
              onClick={actions.onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
              <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}

        {/* Multiple Nodes Context */}
        {context === 'multi-node' && (
          <>
            <ContextMenuItem onClick={actions.onGroup}>
              <Group className="w-4 h-4 mr-2" />
              Group ({selectedCount} nodes)
              <ContextMenuShortcut>⌘G</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={actions.onCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy All
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={actions.onCut}>
              <Scissors className="w-4 h-4 mr-2" />
              Cut All
              <ContextMenuShortcut>⌘X</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <AlignHorizontalJustifyCenter className="w-4 h-4 mr-2" />
                Align
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={actions.onAlignHorizontal}>
                  <AlignHorizontalJustifyCenter className="w-4 h-4 mr-2" />
                  Align Horizontally
                </ContextMenuItem>
                <ContextMenuItem onClick={actions.onAlignVertical}>
                  <AlignVerticalJustifyCenter className="w-4 h-4 mr-2" />
                  Align Vertically
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem 
              onClick={actions.onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All
              <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}

        {/* Group Context */}
        {context === 'group' && (
          <>
            <ContextMenuItem onClick={actions.onUngroup}>
              <Ungroup className="w-4 h-4 mr-2" />
              Ungroup
              <ContextMenuShortcut>⌘⇧G</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={actions.onCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Group
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={actions.onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Group
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
