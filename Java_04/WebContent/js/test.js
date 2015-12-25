//-----------------------------------------------------------
//	[test.js]	KAZUMA NAGAOKA
//
//-----------------------------------------------------------
//##グローバル変数
var g_CurrentNum = -1;
var g_UpdataCurrentNum = -1;
var g_SelectAction = false;
var g_tableNum = -1;


//-----------------------------------------------------------
//	ロード実行
//	--スクリプトが実行できる状態になったら--
//-----------------------------------------------------------
$(document).ready( function() {


	//DataBase更新
	$("#list").jqGrid({
		    url: 'ajax/DBConection',
		    datatype: 'json',
		   mtype: 'GET',
		   colNames:['No', 'ユーザID', 'パスワード',"添付<br>書類", '表示名'],
		   colModel :[
		     {name:'id', width:95,editable:true},
		     {name:'userId', width:90},
		     {name:'userPass', width:90},
		     {index:'rb', name:'rb', align:'center',width:90,height:55, formatter:rbtnFmatter},
		     {name:'displayName', width:150},
		   ],
           cellEdit: false,                // false: セルの直接編集はしな
		   rowNum:100,
		   rowList:[10,20,30],
		   sortname: 'no',
		   sortorder: "asc",
		   scroll: true,
		   viewrecords: true,
		   caption: 'ログイン',

		   gridComplete : function(){
			   SelectRow();
			   SelectRowUpdata();
		   }
		});

	//
	function rbtnFmatter(cellvalue, options, rowObject)
	{
	    //input タグをリターンする
	    var rbtn = '<input type="button" value="添付" name="rbtn" id="rbtn' + options['rowId'] + '" ' +
	               'onclick="selRow(\'' + options['rowId'] + '\')"/>';

	    return rbtn;
	}

	$('#list').click(function(){

		SelectRowUpdata();
		});

	$( "#dialog" ).dialog({
		autoOpen: false,
		width: 680,
		height:320,
		buttons: []
	});

	$( "#dialogU" ).dialog({
		autoOpen: false,
		width: 680,
		height:320,
		buttons: []
	});

	// ファイル選択後に処理
	$("#fileselect").change(function () {
		// 現在のファイル数
		var files= document.getElementById("fileselect").files;
		for (var i = 0; i < files.length; i++){
			// ファイル数分スロット作成
			addfile2(i,files[i].name);
		    //alert(files[i].name);
		}
	    //$(this).closest("form").submit();


	  });



});
//-----------------------------------------------------------
//	重複チェック
//	--ユーザID パスワード--	return bool
//-----------------------------------------------------------
function OverlapCheck(chId1,chPass1,chId2,chPass2)
{
	if(chId1 == chId2 && chPass1 == chPass2)
	{
		return true;
	}
	return false;
}
//-----------------------------------------------------------
//	ダイアログボックスverADD open
//	--jQuery--
//-----------------------------------------------------------
function dialogOpenAdd()
{
	$( "#dialogU" ).dialog( "close" );
	var hiduke = new Date();
	var year = hiduke.getFullYear();
	var month = hiduke.getMonth()+1;
	var day = hiduke.getDate();
	var hour = hiduke.getHours();
	var minute = hiduke.getMinutes();
	var second = hiduke.getSeconds();

	document.getElementById('datetime').value = year+"-"+month+"-"+day+"T"+hour+":"+minute+":"+second;

	var element4 = document.getElementById("addId");
    // 現在の最大のID番号取得
    var arrrows = $("#list").getRowData();
    var max = 0;
    for (i = 0; i < arrrows.length; i++)
    {
        var cur = parseInt(arrrows[i].id);
        if (max < cur)
        {
            max = cur;
            //console.log(max);
        }
    }
    // 現在の最大ID割り当て
    element4.innerHTML = max+1;

	$( "#dialog" ).dialog( "open" );
}
//-----------------------------------------------------------
//ダイアログボックスverUPDATE open
//--jQuery--
//-----------------------------------------------------------
function dialogOpenUpdate()
{
	$( "#dialog" ).dialog( "close" );
    // 現在の選択されている行を取得
	var CurrentIdList = $("#list").getGridParam("selrow");

	// 登録日時はファイルを作り以降更新
	var hiduke = new Date();
	var year = hiduke.getFullYear();
	var month = hiduke.getMonth()+1;
	var day = hiduke.getDate();
	var hour = hiduke.getHours();
	var minute = hiduke.getMinutes();
	var second = hiduke.getSeconds();
	document.getElementById('datetime2').value = year+"-"+month+"-"+day+"T"+hour+":"+minute+":"+second;

	if(CurrentIdList)
	{
		$( "#dialogU" ).dialog( "open" );
	}
	else
	{
		alert("選択されてません");
	}
}
//-----------------------------------------------------------
//	データベース	追加
//
//-----------------------------------------------------------
function addRow()
{
	var element0 = $("#userId");
	var element1 = $("#userPassword");
	var element2 = $("#userName");


    // 現在の最大のID番号取得
    var arrrows = $("#list").getRowData();
    var max = 0;

    for (i = 0; i < arrrows.length; i++)
    {
        var cur = parseInt(arrrows[i].id);
        if (max < cur)
        {
            max = cur;
            //console.log(max);
        }
    }
    var tmpData = {
    		no: max + 1,
    };
    var str1=element0.val();
    var str2=element1.val();
    var str3=element2.val();

    var data = {"UserNo" : tmpData.no,
			"UserName" : str1,
			"UserPass" : str2,
			"DispName" : str3,
		};

    // rowId取得(#list)
	var arrayData =[]; // 配列の初期化
	var overFlag = false;

	if(!str1=="" && !str2=="" && !str3=="")
	{

		for(var i = 0;i<=arrrows.length;i++)
		{
			arrayData[i] = $('#list').jqGrid('getRowData', i+1);
			if(OverlapCheck(arrayData[i].userId,arrayData[i].userPass,data.UserName,data.UserPass))
			{
				alert("入力されたユーザー名とパスワードは\nすでに登録されているため\n追加登録できません");
				overFlag = true;
				break;
			}
		}

		if(!overFlag)
		{
			 $.ajax({
		         type: "POST",
		         url: 'DataBase/DataBaseAdd',
		         data:data,
		         dataType: "json",
		         async: false,
		         success: function(){
				g_CurrentNum = 0;
				//最大行番号数選択
				//DataBase更新
				DataBaseUpdata();

					}
		     });
			 $( "#dialog" ).dialog( "close" );
		}


	}
	else
	{
		alert("未記入項目があります");
		if(str1=="")
		{
			element0.focus();
			element0.setSelectionRange(0,0);
		}
		else if(str2=="")
		{
			element1.focus();
			element1.setSelectionRange(0,0);
		}
		else if(str3=="")
		{
			element2.focus();
			element2.setSelectionRange(0,0);
		}

	}



}
//-----------------------------------------------------------
//データベース	削除
//
//-----------------------------------------------------------
function deleteRow()
{
	$( "#dialog" ).dialog( "close" );
	$( "#dialogU" ).dialog( "close" );
    // 選択されている行番号を取得
    var sel_id = $("#list").getGridParam("selrow");
    var index = $("#list").jqGrid('getInd',sel_id); // counting from 1

    // 現在の選択されている行を取得
	var CurrentIdList = $("#list").getGridParam("selrow");
    // rowId取得(#list)
    var rowIdList = $("#list").jqGrid('getDataIDs');
    // 選択されている行のﾃﾞｰﾀ取得
    var listData = $('#list').jqGrid('getRowData', CurrentIdList);
	var data = {"UserNo" : listData.id};

	if(CurrentIdList)
	{

		if(window.confirm('削除しますか？'))
		{
			$.ajax({
		         type: "POST",
		         url: 'DataBase/DataBaseDelete',
		         data:data,
		         dataType: "json",
		         async: false,
		         success: function(){
				//DataBase更新
				DataBaseUpdata();
				g_CurrentNum = index;


					}
		     });

		}

	}
	else
	{
		alert("選択されてません");
	}

	rowIdList = $("#list").jqGrid('getDataIDs');


    // 行選択(rowId指定)
	//$("#list").setSelection(rowIdList[1],true);
	// $("#list").setSelection(idyhoo[8],false); 反応なし
	// $("#list").resetSelection 選択解除
}
//-----------------------------------------------------------
//データベース	更新
//
//-----------------------------------------------------------
function updataRow()
{
    // 選択されている行番号を取得
    var sel_id = $("#list").getGridParam("selrow");
    var index = $("#list").jqGrid('getInd',sel_id); // counting from 1
    // 現在の選択されている行を取得
	var CurrentIdList = $("#list").getGridParam("selrow");
    // rowId取得(#list)
    var rowIdList = $("#list").jqGrid('getDataIDs');
    var listData = $('#list').jqGrid('getRowData', CurrentIdList);

    // 現在の最大のID番号取得
    var arrrows = $("#list").getRowData();

 // ID取得(キャレット変更用) ダイアログVer
	var element0 = $("#userId2");
	var element1 = $("#userPassword2");
	var element2 = $("#userName2");

    var str1=element0.val();
    var str2=element1.val();
    var str3=element2.val();

	var data = {"UserNo" : listData.id,
			"UserName" : str1,
			"UserPass" : str2,
			"DispName" : str3,
		};

    // rowId取得(#list)
	var arrayData =[]; // 配列の初期化
	var overFlag = false;

	if(CurrentIdList)
	{
		for(var i = 0;i<=arrrows.length;i++)
		{
			arrayData[i] = $('#list').jqGrid('getRowData', i);

			if(OverlapCheck(arrayData[i].userId,arrayData[i].userPass,data.UserName,data.UserPass))
			{
				alert("入力されたユーザー名とパスワードは\nすでに登録されているため\n更新できません");
				overFlag = true;
				break;
			}
		}
		if(!overFlag)
		{
		 $.ajax({
	         type: "POST",
	         url: 'DataBase/DataBaseEdit',
	         data:data,
	         dataType: "json",
	         async: false,
	         success: function(){
			//DataBase更新
			DataBaseUpdata();
			g_UpdataCurrentNum = index;
				}
	     });
		}

	}
	else
	{
		alert("選択されてません");
	}


}
//-----------------------------------------------------------
// データベース更新
//
//-----------------------------------------------------------
function DataBaseUpdata()
{

	$("#list").trigger("reloadGrid");
	return;

	//DataBase更新
	$("#list").jqGrid({
		    url: 'ajax/DBConection',
		    datatype: 'json',
		   mtype: 'GET',
		   colNames:['No', 'ユーザID', 'パスワード', '表示名'],
		   colModel :[
		     {name:'id', width:95},
		     {name:'userId', width:90},
		     {name:'userPass', width:90},
		     {name:'displayName', width:150},
		   ],
		   rowNum:100,
		   rowList:[10,20,30],
		   sortname: 'no',
		   sortorder: "asc",
		   scroll: true,
		   viewrecords: true,
		   caption: 'ログイン',
		});

}
//-----------------------------------------------------------
// JQgrid 行選択
//
//-----------------------------------------------------------
function SelectRow()
{
	var rowMax = $("#list").getGridParam("records");
	var rowIdList = $("#list").jqGrid('getDataIDs');

	if(g_CurrentNum != -1)
	{
		if(g_CurrentNum == 0)
		{
			g_CurrentNum = rowMax;
		}
		if(g_CurrentNum == rowMax+1)
		{
			g_CurrentNum = rowMax;
		}
		g_CurrentNum--;
		$("#list").setSelection(rowIdList[g_CurrentNum],true);
		g_CurrentNum = -1;
	}
	if(g_UpdataCurrentNum != -1)
	{
		g_UpdataCurrentNum--;
		$("#list").setSelection(rowIdList[g_UpdataCurrentNum],true);
		g_UpdataCurrentNum = -1;
	}
}
//-----------------------------------------------------------
//
//
//-----------------------------------------------------------
function SelectRowUpdata()
{
	// ID取得(キャレット変更用)
	var element0 = document.getElementById("userId2");
	var element1 = document.getElementById("userPassword2");
	var element2 = document.getElementById("userName2");
	var element3 = document.getElementById("userNum");
	var element4 = document.getElementById("uid");

	// 選択されている行データ取得
	var selectRow = $("#list").getGridParam('selrow');
	 var rowdata = $('#list').jqGrid('getRowData', selectRow);

	 if(selectRow)
	 {
		 // 要素に値渡し
			element0.value = rowdata.userId;
			element1.value = rowdata.userPass;
			element2.value = rowdata.displayName;
			element3.value = rowdata.id;
			element4.innerHTML = rowdata.id;
	 }
	 else
	 {
		 if(element0 && element0 && element0)
		{
		 // 要素空
			element0.value = '';
			element1.value = '';
			element2.value = '';
			element3.value = '';
			element4.value = '';
		}
	 }


}
function O()
{
	$.ajax({
        type: "POST",
        url: 'DataBase/DataBaseDelete',
        data:data,
        dataType: "json",
        async: false,
        success: function(){
		//DataBase更新
		T();

			}
    });

}
//-----------------------------------------------------------
//アップロード(予定/後)画像 スロット追加
// 強制的にスロット追加
//-----------------------------------------------------------
function AddFile()
{
	for(var i=0;i<5;i++)
	{
		addfile(i);
	}
}
//-----------------------------------------------------------
//アップロード(予定/後)画像 スロット追加
// 引数:(int num)
//-----------------------------------------------------------
function addfile(num)
{
	var count = num;
	var con = $(files);
	con.append("<input type='text' name='xxx' class='tekito"+count+"' /><button class='dlg-btn"+count+"'style='width:32px;height:32px;'onclick='TEST("+num+")'></button>");
	$('.dlg-btn'+num).button({
		icons: { primary: "ui-icon-closethick" },
	});
}
//-----------------------------------------------------------
//アップロード(予定/後)画像 スロット追加
// 引数:(int num,String name)
//-----------------------------------------------------------
function addfile2(num,name)
{
	var count = num;
	var filename = name;
	var con = $(fileso);
	con.append("<input type='text' name='xxx' value='"+filename+"' class='tekito"+count+"' /><button class='dlg-btn"+count+"'style='width:32px;height:32px;'onclick='TEST("+num+")'></button>");
	$('.dlg-btn'+num).button({
		icons: { primary: "ui-icon-closethick" },
	});
}
//-----------------------------------------------------------
//アップロード(予定/後)画像 指定削除
//
//-----------------------------------------------------------
function TEST(i)
{
	var ova = "";
	// ajax通信 Actionへデータ(型:Integer) 送信と受信
	var data = {"m_Num" : i,"param" : "asd"};
	$.ajax({
        type: "GET",
        url: 'uplo/GetImageFileNum',
        data:data,
        dataType: "json",
        async: false,
        success: function(json){
        	alert(json);

			}
    });
	$.ajax({
        type: "GET",
        url: 'uplo/GetImageFileName',
        dataType: "json",
        async: false,
        success: function(data){
        	alert(data[0].m_filename);
        	ova = data[0].m_filename;
        	alert(ova);
			}
    });
	$(files).find('.dlg-btn'+i).remove();
	$(files).find('.tekito'+i).remove();

}
//-----------------------------------------------------------
// アップロード(予定/後)画像クリア
//
//-----------------------------------------------------------
function UploadClear()
{
	document.getElementById("fileselect").value = "";
	// 子ノード解析
	var aNode = document.getElementById("fileso");
	for (var i =aNode.childNodes.length-1; i>0; i--) {
		aNode.removeChild(aNode.childNodes[i]);
	}

}