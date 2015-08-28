var Crawler = require("crawler");
var fs = require('fs');
//var url = require('url');
var maxUrl = 250;

var writeStream = fs.createWriteStream("file.xls");
var header="Nome"+"\t"+" Site"+"\t"+"CRECI"+"\t"+"Telefone"+"\t"+"Celular"+"\t"+"Email"+"\n";
writeStream.write(header);
writeStream.close();

var saveString = "";
var time = null;
count = 0;

function writeFile () {
    var aux = saveString;
    saveString = "";
    console.log("Salvando arquivo....")
    var writeStream = fs.createWriteStream("file.xls", {'flags': 'a'});    
    writeStream.write(aux);
    writeStream.close();
    console.log("Arquivo salvo");
    aux = "";
};

var rows = [];
function makeQueue(data){
    rows.push(data);
};

var c = new Crawler({
    maxConnections : 10,
    callback : function (error, result, $) {
        $('.busca-corretores-resultado .media a.pull-left').each(function(index, a) {
            var toQueueUrl = "http://www.sitedoscorretores.com" + $(a).attr("href");
            c.queue([{ //Callback proprio
                uri: toQueueUrl,
                callback: function (error, corretor, $) {
                    var t = $(".lado-direito");
                    count ++;
                    var data = {};
                    data.nome = t.find("h3").html();
                    var ul = t.find(".list-unstyled").children("li");
                    data.site = ul.eq(0).find("span").html();
                    data.creci = ul.eq(1).find("span").html();
                    data.telefone = ul.eq(2).find("span").html();
                    data.celular = ul.eq(3).find("span").html();
                    data.email = ul.eq(4).find("span").html();

                    console.log("Corretor["+count+"]", data.nome);
                    var row = data.nome+"\t"+data.site+"\t"+data.creci+"\t"+data.telefone+"\t"+data.celular+"\t"+data.email+"\n";
                    saveString += row;
                    if (count % 100 == 0){ //Escreve a cada 100 registros
                        //count = 0;
                        writeFile();
                        return 0;
                    }
                    if ((time != null) && (typeof time != "undefined")){
                        clearTimeout(time);
                    }
                    time = setTimeout(writeFile, 2000); //Ou se ficar 2 segundos sem receber um novo callback
                }
            }]);
        });
    }
});

//c.queue("http://www.sitedoscorretores.com/corretores/busca/page:1");

var fila = [];
for (var i = 1; i <= maxUrl; i++ ){
    fila.push("http://www.sitedoscorretores.com/corretores/busca/page:"+i);
}

c.queue(fila);