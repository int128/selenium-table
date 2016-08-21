$(function () {
    var ViewModel = function () {
        var self = this;

        this.scenarioHtml = ko.observable();
        this.scenario = ko.computed(function () {
            var table = $(self.scenarioHtml());
            return {
                header: $('thead', table).html(),
                rows: $('tbody>tr', table).map(function (_, tr) {
                    return {
                        columns: $('td', tr).map(function (_, td) {
                            return {
                                value: $(td).text(),
                                variableIndex: ko.observable()
                            };
                        }).get()
                    };
                }).get()
            };
        });

        this.replacementRules = ko.computed(function () {
            var replacementRules = [];
            self.scenario().rows.forEach(function (row, i) {
                row.columns.forEach(function (column, j) {
                    if ($.isNumeric(column.variableIndex())) {
                        replacementRules.push({
                            row: i,
                            column: j,
                            variableIndex: column.variableIndex()
                        });
                    }
                });
            });
            return replacementRules;
        });

        this.testDataFormat = ko.observable('csv');
        this.testDataText = ko.observable('');
        this.testData = ko.computed(function () {
            var delimiter = self.testDataFormat() == 'tsv' ? '\t' : null;
            return parseCSV(self.testDataText(), delimiter);
        });

        this.variableOptions = ko.computed(function () {
            var firstColumn = self.testData()[0];
            if (firstColumn) {
                return firstColumn;
            } else {
                return [];
            }
        });

        this.expandedHtml = ko.computed(function () {
            var replacementRules = self.replacementRules();

            var table = $(self.scenarioHtml());
            var template = $('tbody>tr', table).remove();
            var cloneRows = function () {
                return template.clone().appendTo($('tbody', table));
            };

            self.testData().forEach(function (testDataRow) {
                var cloned = cloneRows();
                replacementRules.forEach(function (rule) {
                    var tr = cloned[rule.row];
                    var td = $('>td', tr)[rule.column];
                    var value = testDataRow[rule.variableIndex];
                    $(td).text(value);
                });
            });

            return table.html();
        });

        $.get('scenario.html').done(function (data) {
            self.scenarioHtml(data);
        });
        $.get('testdata.txt').done(function (data) {
            self.testDataText(data);
        });
    };
	ko.applyBindings(new ViewModel());
});
/**
 * CSV parser (minified)
 * @see http://liosk.blog103.fc2.com/blog-entry-75.html
 */
function parseCSV(a,b){if(!b)b=",";var c=new RegExp(b+"|\r?\n|[^"+b+'"\r\n][^'+b+'\r\n]*|"(?:[^"]|"")*"',"g");var d=0,e=0,f=[[""]],g=/""/g;a.replace(/\r?\n$/,"").replace(c,function(a){switch(a){case b:f[d][++e]="";break;case"\n":case"\r\n":f[++d]=[""];e=0;break;default:f[d][e]=a.charAt(0)!='"'?a:a.slice(1,-1).replace(g,'"');}});return f;}
