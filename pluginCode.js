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
                    frameEditorId: window.parent.frameEditorId,
                }, "*")
            })
        }, 100)
    }
    // 跳转到指定表格位置
    function selectPositionInTheTable(data) {
        console.log("selectPositionInTheTable", data);
        window.Asc.scope.selectPositionInTheTableData = data;
        window.Asc.plugin.callCommand(() => {
            let doc = Api.GetDocument();
            doc.RemoveSelection()
        }, false, true, (returnValue) => { })
        setTimeout(() => {
            window.Asc.plugin.callCommand(() => {
                let { tableIndex, rowIndex, cellIndex, start, end } = Asc.scope.selectPositionInTheTableData;
                let doc = Api.GetDocument();
                let tables = doc.GetAllTables();
                let table = tables[tableIndex];
                if (!table) {
                    return "没有找到对应的表格";
                }
                let cell = table.GetCell(rowIndex, cellIndex);
                if (!cell) {
                    return "没有找到对应的单元格";
                }
                let range = cell.GetContent().GetRange(start, end);
                range.Select();
                return range.GetText();
            }, false, true, (returnValue) => {
                window.parent.parent.postMessage({
                    command: 'selectPositionInTheTable',
                    data: returnValue,
                    frameEditorId: window.parent.frameEditorId,
                }, "*")
            })
        }, 100)
    }
    // 保存文档
    function saveDocument() {
        window.Asc.plugin.callCommand(() => {
            Api.Save();
        }, false, true, (returnValue) => {
            window.parent.parent.postMessage({
                command: 'save',
                frameEditorId: window.parent.frameEditorId,
            }, "*")
        })
    }
    // 搜索文字
    function searchContent(data) {
        window.Asc.scope.searchContentData = data;
        window.Asc.plugin.callCommand(() => {
            let doc = Api.GetDocument();
            doc.RemoveSelection()
        }, false, true, (returnValue) => { })
        setTimeout(() => {
            window.Asc.plugin.callCommand(() => {
                let { inputLocText, inputLocNo } = Asc.scope.searchContentData;
                let doc = Api.GetDocument();
                let results = doc.Search(inputLocText);
                let targetResult = results[inputLocNo - 1] || results[0];
                if (targetResult) {
                    targetResult.Select();
                }
                return results.length
            }, false, true, (returnValue) => {
                window.parent.parent.postMessage({
                    command: 'searchContent',
                    data: returnValue,
                    frameEditorId: window.parent.frameEditorId,
                }, "*")
            })
        }, 100)
    }
    // 插入文字
    function insertContent(data) {
        const { text } = data;
        window.Asc.plugin.executeMethod("PasteText", [text], () => {
            window.parent.parent.postMessage({
                command: 'PasteText',
                frameEditorId: window.parent.frameEditorId,
            }, "*")
        });
    }
    // 插入html
    function insertHtml(data) {
        window.Asc.plugin.executeMethod("PasteHtml", [data]);
    }
    // 按指定位置高亮背景色
    function setHighlight(data) {
        window.Asc.scope.setHighlightData = data;
        window.Asc.plugin.callCommand(() => {
            let { paragraphIndex, start, end, color } = Asc.scope.setHighlightData;
            let doc = Api.GetDocument();
            let paragraph = doc.GetElement(paragraphIndex);
            let range = paragraph.GetRange(start, end);
            range.SetHighlight(color || 'red')
            return range.GetText();
        }, false, true, (returnValue) => {
            window.parent.parent.postMessage({
                command: 'setHighlight',
                frameEditorId: window.parent.frameEditorId,
                data: returnValue,
            }, "*")
        });
    }
    // 初始化插件
    window.Asc.plugin.init = () => {
        window.parent.Common.Gateway.on('internalcommand', (data) => {
            const { command } = data;
            switch (command) {
                case 'jumpToPositionByIndex':
                    selectPositionInTheParagraph(data.data);
                    break;
                case "jumpToPositionByTableIndex":
                    selectPositionInTheTable(data.data);
                    break
                case 'save':
                    saveDocument()
                    break;
                case "searchContent":
                    searchContent(data.data);
                    break
                case "insertContent":
                    insertContent(data.data);
                    break
                // 插入html
                case "insertHtml":
                    insertHtml(data.data);
                    break;
                case "setHighlight":
                    setHighlight(data.data);
                    break;
                default:
                    break;
            }
        });
        window.parent.parent.postMessage({
            command: 'maiyuePluginReady',
            frameEditorId: window.parent.frameEditorId,
        }, "*")
    };
})(window, undefined);