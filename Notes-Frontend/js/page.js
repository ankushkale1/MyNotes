function pageInit()
{
    getNoteBookMeta();
}

var current_notebook = null;
var current_note = null;

var notebook_meta_map = new Map();

var note_json = null;

var current_page = 0;
var per_page = 20;

function getNote(noteid)
{
    //console.log(editor.container.innerHTML);

    $.ajax({
        type: "GET",
        url: SERVER_URLS.GET_NOTE.replace('{noteid}',noteid),
        //url: "https://591dea16-659a-4324-88bf-2df285701d78.mock.pstmn.io/notes/getNote/14",
        success: function(res)
        {
            try
            {
                var data = JSON.parse(res.jsonnotes);
                editor.setContents(data,'api');
            }catch(e){
                editor.container.firstChild.innerHTML = res.jsonnotes;
            }

            //var delta_ops = { "ops" : data.ops.slice(current_page*per_page,(current_page*per_page)+per_page) };
            //editor.setContents(new editor.delta(delta_ops),'api');
            
            //editor.container.firstChild.innerHTML="";
            //editor.container.firstChild.innerHTML = res.jsonnotes;
            
            $('#notename').text(res.notename);
            current_note = res;
            current_notebook = notebook_meta_map.get(res.notebook_id);
            $('#currentNotebook').text(current_notebook.notebookname);
            //note_json = JSON.parse(res);
            //editor.setContents(JSON.parse(res));
        },
        error: function(res,statuscode)
        {
            console.info(res+" "+statuscode);
        },
      });
}

/*function getNextContent()
{
    var old_length = (current_page*per_page)+per_page;
    current_page++;

    var data = JSON.parse(current_note.jsonnotes);
    var start = (current_page*per_page)+1;
    var end = (current_page*per_page)+per_page;

    var delta_ops = { "ops" : data.ops.slice(start,end) };

    var delta = editor.getContents().retain(old_length).concat(delta_ops);
    editor.updateContents(delta);
}*/

function getNoteBookMeta()
{
    $.ajax({
        type: "GET",
        url: SERVER_URLS.GET_NOTEBOOKS,
        success: function(res)
        {
            for(i=0;i<res.length;i++)
            {
                notebook_meta_map.set(res[i].notebook_id,res[i]);
            }

            populateNoteBooks();
        },
        error: function(res,statuscode)
        {
            console.info(res+" "+statuscode);
        },
      });
}

function addNotebook(notebookname)
{
    $.ajax({
        type: "GET",
        url: SERVER_URLS.ADD_NOTEBOOK+"/"+notebookname,
        success: function(res)
        {
            notebook_meta_map.set(res.notebook_id,res);
            populateNoteBooks();
        },
        error: function(res,statuscode)
        {
            console.info(res+" "+statuscode);
        },
    }); 
}

function getPlainContent()
{
    var html = editor.container.innerHTML;
    html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
    html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
    html = html.replace(/<\/div>/ig, '\n');
    html = html.replace(/<\/li>/ig, '\n');
    html = html.replace(/<li>/ig, '  *  ');
    html = html.replace(/<\/ul>/ig, '\n');
    html = html.replace(/<\/p>/ig, '\n');
    html = html.replace(/<br\s*[\/]?>/gi, "\n");
    html = html.replace(/<[^>]+>/ig, '');
    html = html.replace(/\n+/g, '\n')

    return html;
}

function addUpdateNote(notename,notebook)
{
    //console.log(editor.container.innerHTML);

    var note = null;

    if(typeof notename == 'undefined') //update existing
    {
        note = {
            "note_id" : current_note.note_id,
            "notename" : current_note.notename,
            "jsonnotes" : JSON.stringify(editor.getContents()),
            "plain_content" : getPlainContent(),
            "keywords" : current_note.keywords,
            "notebook" : {
                "notebook_id" : current_note.notebook_id
            }
        }

        $.ajax({
            type: "POST",
            url: SERVER_URLS.ADD_NOTE,
            data: JSON.stringify(note),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(res)
            {
                //editor.container.innerHTML = res.jsonnotes;
            },
            error: function(res,statuscode)
            {
                console.info(res+" "+statuscode);
            },
          });
    }
    else
    {
        note = {
            "note_id" : null,
            "notename" : notename,
            "jsonnotes" : "Hello World",
            "keywords" : ['Test'],
            "notebook" : {
                "notebook_id" : notebook
            }
        }

        $.ajax({
            type: "POST",
            url: SERVER_URLS.ADD_NOTE,
            data: JSON.stringify(note),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(res)
            {
                notebook_meta_map.get(res.notebook_id).notes.push(res);
                current_note=res;
                current_notebook=notebook_meta_map.get(res.notebook_id);
                editor.container.firstChild.innerHTML = "";
                $('#notename').text(res.notename);
                $('#currentNotebook').text(current_notebook.notebookname);
            },
            error: function(res,statuscode)
            {
                console.info(res+" "+statuscode);
            },
          });

        populateNoteBooks();
    }  
}

function deleteNotebook(notebookid)
{
    if (confirm('Delete Notebook ??')) 
    {
        $.ajax({
            type: "GET",
            url: SERVER_URLS.DELETE_NOTEBOOK+"/"+notebookid,
            success: function(res)
            {
                notebook_meta_map.delete(notebookid);
                populateNoteBooks();
            },
            error: function(res,statuscode)
            {
                console.info(res+" "+statuscode);
            },
        });
    }
}

function deleteNote(noteid)
{
    if (confirm('Delete Note ??')) 
    {
        $.ajax({
            type: "GET",
            url: SERVER_URLS.DELETE_NOTE+"/"+noteid,
            success: function(res)
            {
                getNoteBookMeta();
            },
            error: function(res,statuscode)
            {
                console.info(res+" "+statuscode);
            },
        });
    }
}


function searchText()
{
    $.ajax({
        type: "GET",
        url: SERVER_URLS.SEARCH.replace('{searchtxt}',$("[name='stxt']").val()),
        success: function(res)
        {
            $('#search-content').html("");

            for(i=0;i<res.length;i++)
            {
                note = res[i];
                //var content = note.plain_content.replaceAll(stext,"<mark>"+stext+"</mark>");
                //console.info(note.notename);
                $('#search-content').append(`

                <div class="card" style="max-height: 200px; overflow: hidden; margin: 10px;">
                    <div class="card-header">
                        <a style="font-size:20px;" data-toggle="collapse" href="#scontent_${note.note_id}" aria-expanded="true" aria-controls="scontent_${note.note_id}">
                            ${note.notename}
                        </a>
                        <span style="cursor: pointer; font-size:20px;" class="fa fa-large-op fa-arrow-circle-o-right" onclick="getNote(${note.note_id})"></span>
                    </div>
                    <div id="scontent_${note.note_id}" class="collapse">
                        <div class="card-block" style="cursor: pointer;" onclick="$.magnificPopup.close();getNote(${note.note_id})">
                            <div class="nid" style='display:none;'>${note.note_id}</div>
                            <div class="nbody">${note.plain_content}</div>
                        </div>
                    </div>
                </div>
                `);
            }
        },
        error: function(res,statuscode)
        {
            console.info(res+" "+statuscode);
        },
    });
}

const dSearch = function(fn,delay)
{
    let timer;

    return function()
    {
        let context = this;
        args = arguments;
        clearTimeout(timer);

        timer = setTimeout(() =>{
            fn.apply(context,args);
        },delay);
    }
}

const search = dSearch(searchText,300);
