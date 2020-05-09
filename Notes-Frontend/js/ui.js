function htmlbodyHeightUpdate(){
    var height3 = $( window ).height()
    var height1 = $('.nav').height()+50
    height2 = $('.main').height()
    if(height2 > height3){
        $('html').height(Math.max(height1,height3,height2)+10);
        $('body').height(Math.max(height1,height3,height2)+10);
    }
    else
    {
        $('html').height(Math.max(height1,height3,height2));
        $('body').height(Math.max(height1,height3,height2));
    }
    
}

function sideBarInit()
{
    htmlbodyHeightUpdate()
    $( window ).resize(function() {
        htmlbodyHeightUpdate()
    });
    $( window ).scroll(function() {
        height2 = $('.main').height()
          htmlbodyHeightUpdate()
    });
}

$(document).ready(function () 
{
    sideBarInit();
    pageInit();
    popup_init();
});

function popup_init()
{
    $(document).ready(function() {
        $('.mypopup').magnificPopup({
        type:'inline',
        midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
        });
    });
}

hljs.configure({ // optionally configure hljs
    languages: ['java']
});

var toolbarOptions = [
    ['bold', 'italic', 'underline', 'code-block'],
    ['link', 'image'],
    [{
        'header': 1
    }, {
        'header': 2
    }], // custom button values
    [{
        'list': 'ordered'
    }, {
        'list': 'bullet'
    }],
    [{
        'indent': '-1'
    }, {
        'indent': '+1'
    }], // outdent/indent

    [{
        'size': ['small', false, 'large', 'huge']
    }], // custom dropdown
    [{
        'header': [1, 2, 3, 4, 5, 6, false]
    }],

    [{
        'color': []
    }, {
        'background': []
    }], // dropdown with defaults from theme
    [{
        'font': []
    }],
    [{
        'align': []
    }],

    ['clean']

];

var editor = null;

//$(document).ready()
$(window).on('load', function () {
    editor = new Quill('#editor', {
        syntax: true,
        modules: {
            toolbar: toolbarOptions
        },
        theme: 'snow',
        imageDrop: true,
        readOnly: false
    });
});

var menu_template = `
        <li data-toggle="collapse" data-target="#nb_{notebook_id}" class="collapsed active">
            <a>
                <i class="fa fa-sticky-note fa-lg"></i> {notebook_name} 
            </a>
            <a onclick="deleteNotebook({notebook_id})">
                <i class="fa fa-trash fa-lg btn pull-right" style="margin-top:5px"></i>
            </a>
        </li>
        <ul class="sub-menu collapse" id="nb_{notebook_id}">
            {menuitems}
        </ul>
`;

var menu_item_template = `
        <li>
            <a id="n_{note_id}" onclick="getNote({note_id})">{note_name}</a>
            <a onclick="deleteNote({note_id})">
                <i class="fa fa-trash fa-lg btn pull-right" style="margin-top:5px"></i>
            </a>
        </li>
`;

var mymenu = "";

function populateNoteBooks()
{
    $('#menu-content').html("");

    $('#mynotebooks').html('');

    for (let value of notebook_meta_map.values())
    {
        var notebook = value;

        var menu = menu_template;
        menu = menu.replaceAll("{notebook_id}",notebook.notebook_id);
        menu = menu.replaceAll("{notebook_name}",notebook.notebookname);

        var menu_items = "";

        //populate create note select
        $('#mynotebooks').append(`<option value="${notebook.notebook_id}"> 
                                ${notebook.notebookname} 
                            </option>`); 

        if(notebook.notes)
        {
            for(var j=0;j<notebook.notes.length;j++)
            {
                var note = notebook.notes[j];
                var menu_item = menu_item_template;
                menu_item = menu_item.replaceAll("{note_id}",note.note_id);
                menu_item = menu_item.replaceAll("{note_name}",note.notename);
                menu_item = menu_items += "\n "+menu_item;
            }

            menu = menu.replaceAll("{menuitems}",menu_items);
        }

        $('#menu-content').append(menu);
        mymenu+="\n "+menu;
    }
}



















String.prototype.replaceAll = function (stringToFind, stringToReplace) {
    if (stringToFind === stringToReplace) return this;
    var temp = this;
    var index = temp.indexOf(stringToFind);
    while (index != -1) {
        temp = temp.replace(stringToFind, stringToReplace);
        index = temp.indexOf(stringToFind);
    }
    return temp;
};