((window, undefined) => {
    // 跳转到指定位置
    function selectPositionInTheParagraph(data) {
        console.log("selectPositionInTheParagraph", data)

        window.Asc.scope.selectPositionInTheParagraphData = data;
        window.Asc.plugin.callCommand(() => {
            let doc = Api.GetDocument();
            doc.RemoveSelection()
        }, false, true, (returnValue) => { })
        setTimeout(() => {
            window.Asc.plugin.callCommand(() => {
                let { paragraphIndex, start, end, replaceText } = Asc.scope.selectPositionInTheParagraphData;
                let doc = Api.GetDocument();
                let paragraph = doc.GetElement(paragraphIndex);
                let range = paragraph.GetRange(start, end);
                if (replaceText) {
                    range.AddText(replaceText, 'after');
                    let deleteRange = paragraph.GetRange(start, end);
                    deleteRange.Delete();
                    range = paragraph.GetRange(start, start + replaceText.length);
                }
                range.Select();
                return paragraph.GetText()
            }, false, true, (returnValue) => {
                window.parent.parent.postMessage({
                    command: 'jumpToPositionByIndex',
                    data: returnValue,
                }, "*")
            })
        }, 100)
    }

    window.Asc.plugin.init = () => {
        window.parent.Common.Gateway.on('internalcommand', (data) => {
            const { command } = data;
            switch (command) {
                case 'jumpToPositionByIndex':
                    selectPositionInTheParagraph(data.data);
                    break;

                default:
                    break;
            }
        });
    };
})(window, undefined);