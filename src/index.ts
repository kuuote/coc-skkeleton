import {events, ExtensionContext, languages, VimCompleteItem, workspace, CancellationToken, CompletionContext, Position, TextDocument, CompletionList, CompletionItem, Range} from 'coc.nvim';

export const activate = async (context: ExtensionContext): Promise<void> => {
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      'skkeleton',
      'skk',
      null,
      {
        provideCompletionItems: async (document: TextDocument, position: Position, _token: CancellationToken, _context: CompletionContext): Promise<CompletionList> => {
          return await getCompletionItems(document, position);
        },
      })
  );
};

const getCompletionItems = async (document: TextDocument, position: Position): Promise<CompletionList> => {
  const offset = document.offsetAt(position);
  const candidates = (await workspace.nvim.call('denops#request', ['skkeleton', 'getCandidates', []])) as Array<
    [string, Array<string>]
  >;
  const preEdit= (await workspace.nvim.call('denops#request', ['skkeleton', 'getPreEdit', []])) as string;
  const range: Range = { start: document.positionAt(offset - preEdit.length), end: position };
  const items = candidates.flatMap((candidate) => {
    const [kana, word] = candidate;
    return word
      .filter((word) => word.trim() !== '')
      .map((word): CompletionItem => ({
        label: word,
        sortText: preEdit,
        filterText: preEdit,
        textEdit: { range, newText: word }
      }));
  });

  return {
    items,
    isIncomplete: false,
  };
};
