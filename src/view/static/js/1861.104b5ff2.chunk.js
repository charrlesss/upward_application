"use strict";(self.webpackChunkupward=self.webpackChunkupward||[]).push([[1861],{56580:function(e,t,n){n.d(t,{a:function(){return c}});var i=n(1413),a=n(45987),o=n(72791),r=n(30948),l=n(80184),d=["onChange"],c=o.forwardRef((function(e,t){var n=e.onChange,o=(0,a.Z)(e,d);return(0,l.jsx)(r.h3,(0,i.Z)((0,i.Z)({},o),{},{getInputRef:t,onValueChange:function(t){n({target:{name:e.name,value:t.value}})},allowNegative:!1,thousandSeparator:!0,valueIsNumericString:!0}))}))},51861:function(e,t,n){n.r(t),n.d(t,{default:function(){return J},reducer:function(){return Y}});var i=n(93433),a=n(74165),o=n(15861),r=n(29439),l=n(4942),d=n(1413),c=n(72791),s=n(48550),u=n(36151),p=n(68096),h=n(94925),f=n(77196),m=n(63466),x=n(13400),g=n(58406),b=n(23786),v=n(64554),y=n(88447),D=n(20890),N=n(85523),C=n(94454),Z=n(13784),I=n(39709),j=n(42419),E=n(29823),T=n(21830),w=n.n(T),S=n(3380),F=n(86753),k=n(91933),A=n(56580),L=n(93263),z=n(79018),P=n(84669),M=n(71652),_=n(93862),R=n(93777),U=n(95643),B=n(5519);var K=n(89767),W=n(64230),O=n(54164),V=n(80184),q={sub_refNo:"",refNo:"",dateEntry:new Date,explanation:"",particulars:"",code:"",acctName:"",subAcct:"",subAcctName:"",IDNo:"",ClientName:"",address:"",credit:"",debit:"",checkNo:"",checkDate:new Date,TC_Code:"",TC_Desc:"",remarks:"",Payto:"",vatType:"NON-VAT",invoice:"",BranchCode:"HO",totalDebit:"",totalCredit:"",totalBalance:"",jobAutoExp:!1,jobTransactionDate:new Date,jobType:"",search:"",cashMode:""},Y=function(e,t){return"UPDATE_FIELD"===t.type?(0,d.Z)((0,d.Z)({},e),{},(0,l.Z)({},t.field,t.value)):e},G=[{field:"code",headerName:"Code",minWidth:150},{field:"acctName",headerName:"Account Name",minWidth:300},{field:"subAcctName",headerName:"Sub Account",flex:1,minWidth:170},{field:"ClientName",headerName:"Name",flex:1,minWidth:300},{field:"debit",headerName:"Debit",minWidth:80},{field:"credit",headerName:"Credit",minWidth:100},{field:"checkNo",headerName:"Check No",minWidth:80},{field:"checkDate",headerName:"Check Date",minWidth:100},{field:"TC_Code",headerName:"TC",minWidth:100},{field:"remarks",headerName:"Remarks",flex:1,minWidth:300},{field:"Payto",headerName:"Payto",minWidth:300},{field:"vatType",headerName:"Vat Type",minWidth:100},{field:"invoice",headerName:"Invoice",flex:1,minWidth:200},{field:"TempID",headerName:"TempId",hide:!0},{field:"IDNo",headerName:"I.D.",flex:1,minWidth:300,hide:!0},{field:"BranchCode",headerName:"BranchCode",flex:1,minWidth:300,hide:!0},{field:"addres",headerName:"addres",hide:!0}];function J(){var e,t,n,l,T,J,Q=(0,c.useRef)(null),X=(0,c.useContext)(S.V),$=X.myAxios,ee=X.user,te=(0,c.useReducer)(Y,q),ne=(0,r.Z)(te,2),ie=ne[0],ae=ne[1],oe=(0,c.useState)(!1),re=(0,r.Z)(oe,2),le=re[0],de=re[1],ce=(0,c.useState)(!1),se=(0,r.Z)(ce,2),ue=se[0],pe=se[1],he=(0,c.useState)(!1),fe=(0,r.Z)(he,2),me=fe[0],xe=fe[1],ge=(0,c.useState)({edit:!1,updateId:""}),be=(0,r.Z)(ge,2),ve=be[0],ye=be[1],De=(0,c.useState)([]),Ne=(0,r.Z)(De,2),Ce=Ne[0],Ze=Ne[1],Ie=(0,k.useQueryClient)(),je=(0,c.useRef)(null),Ee=(0,c.useRef)(null),Te=(0,c.useRef)(null),we=(0,c.useRef)(null),Se=(0,c.useRef)(null),Fe=(0,c.useRef)(null),ke=(0,c.useRef)(null),Ae=(0,c.useRef)(null),Le=(0,c.useRef)(null),ze=(0,c.useRef)(null),Pe=(0,c.useRef)(null),Me=(0,c.useRef)(null),_e=(0,c.useRef)(null),Re=(0,c.useRef)(null),Ue=(0,k.useQuery)({queryKey:"general-journal-id-generator",queryFn:function(){return(e=e||(0,o.Z)((0,a.Z)().mark((function e(){return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,$.get("/task/accounting/cash-disbursement/generate-id",{headers:{Authorization:"Bearer ".concat(null===ee||void 0===ee?void 0:ee.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},refetchOnWindowFocus:!1,onSuccess:function(e){var t=e;ae({type:"UPDATE_FIELD",field:"refNo",value:t.data.generatedId[0].id}),ae({type:"UPDATE_FIELD",field:"sub_refNo",value:t.data.generatedId[0].id})}}),Be=Ue.isLoading,Ke=Ue.refetch,We=(0,k.useMutation)({mutationKey:"add-cash-disbursement",mutationFn:function(e){return(t=t||(0,o.Z)((0,a.Z)().mark((function e(t){return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,$.post("/task/accounting/cash-disbursement/add-cash-disbursement",t,{headers:{Authorization:"Bearer ".concat(null===ee||void 0===ee?void 0:ee.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},onSuccess:function(e){var t=e;return t.data.success?(Ie.invalidateQueries("search-general-journal"),xe(!1),H(ae,q),Ke(),Ze([]),ye({edit:!1,updateId:""}),w().fire({position:"center",icon:"success",title:t.data.message,timer:1500})):w().fire({position:"center",icon:"warning",title:t.data.message,timer:1500})}}),Oe=We.mutate,Ve=We.isLoading,qe=(0,k.useMutation)({mutationKey:"jobs",mutationFn:function(e){return(n=n||(0,o.Z)((0,a.Z)().mark((function e(t){return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,$.post("/task/accounting/general-journal/jobs",t,{headers:{Authorization:"Bearer ".concat(null===ee||void 0===ee?void 0:ee.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},onSuccess:function(e){var t=e;Ze([]),Ze(t.data.jobs),de(!1)}}),Ye=qe.mutate,Ge=qe.isLoading,Je=(0,k.useMutation)({mutationKey:"void-cash-disbursement",mutationFn:function(e){return(l=l||(0,o.Z)((0,a.Z)().mark((function e(t){return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,$.post("/task/accounting/cash-disbursement/void-cash-disbursement",t,{headers:{Authorization:"Bearer ".concat(null===ee||void 0===ee?void 0:ee.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},onSuccess:function(e){var t=e;return t.data.success?(Ie.invalidateQueries("search-general-journal"),xe(!1),H(ae,q),Ke(),Ze([]),ye({edit:!1,updateId:""}),w().fire({position:"center",icon:"success",title:t.data.message,timer:1500})):w().fire({position:"center",icon:"warning",title:t.data.message,timer:1500})}}),He=Je.mutate,Qe=Je.isLoading,Xe=(0,k.useMutation)({mutationKey:"get-selected-search-general-journal",mutationFn:function(e){return(T=T||(0,o.Z)((0,a.Z)().mark((function e(t){return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,$.post("/task/accounting/cash-disbursement/get-selected-search-cash-disbursement",t,{headers:{Authorization:"Bearer ".concat(null===ee||void 0===ee?void 0:ee.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},onSuccess:function(e){var t=e.data.selectedCashDisbursement,n=t[0],i=n.explanation,a=n.dateEntry,o=n.refNo,r=n.particulars;ae({type:"UPDATE_FIELD",field:"sub_refNo",value:o}),ae({type:"UPDATE_FIELD",field:"refNo",value:o}),ae({type:"UPDATE_FIELD",field:"dateEntry",value:a}),ae({type:"UPDATE_FIELD",field:"explanation",value:i}),ae({type:"UPDATE_FIELD",field:"particulars",value:r}),Ze(t),xe(!0)}}),$e=Xe.mutate,et=Xe.isLoading,tt=(0,L.Z)({link:{url:"/task/accounting/cash-disbursement/search-cash-disbursement",queryUrlName:"searchCashDisbursement"},columns:[{field:"Date_Entry",headerName:"Date",width:130},{field:"Source_No",headerName:"Ref No.",width:250},{field:"Explanation",headerName:"Explanation",flex:1}],queryKey:"search-cash-disbursement",uniqueId:"Source_No",responseDataKey:"search",onSelected:function(e,t){$e({Source_No:e[0].Source_No}),Dt({target:{value:"edit",name:"cashMode"}}),Ze([]),ye({edit:!1,updateId:""}),ot()},onCloseFunction:function(e){ae({type:"UPDATE_FIELD",field:"search",value:e})},searchRef:Pe}),nt=tt.ModalComponent,it=tt.openModal,at=tt.isLoading,ot=tt.closeModal,rt=(0,L.Z)({link:{url:"/task/accounting/general-journal/get-chart-account",queryUrlName:"chartAccountSearch"},columns:[{field:"Acct_Code",headerName:"Account Code",width:130},{field:"Acct_Title",headerName:"Account Title.",width:250},{field:"Short",headerName:"Short",flex:1}],queryKey:"get-chart-account",uniqueId:"Acct_Code",responseDataKey:"getChartOfAccount",onSelected:function(e,t){ae({type:"UPDATE_FIELD",field:"code",value:e[0].Acct_Code}),ae({type:"UPDATE_FIELD",field:"acctName",value:e[0].Acct_Title}),st(),setTimeout((function(){var e;null===(e=Fe.current)||void 0===e||e.focus()}),250)},searchRef:Pe}),lt=rt.ModalComponent,dt=rt.openModal,ct=rt.isLoading,st=rt.closeModal,ut=(0,L.Z)({link:{url:"/task/accounting/search-pdc-policy-id",queryUrlName:"searchPdcPolicyIds"},columns:[{field:"Type",headerName:"Type",width:130},{field:"IDNo",headerName:"ID No.",width:200},{field:"Name",headerName:"Name",flex:1},{field:"ID",headerName:"ID",hide:!0}],queryKey:"get-policyId-ClientId-RefId",uniqueId:"IDNo",responseDataKey:"clientsId",onSelected:function(e){ue?(ae({type:"UPDATE_FIELD",field:"Payto",value:e[0].Name}),mt(),setTimeout((function(){var e;null===(e=Ae.current)||void 0===e||e.focus()}),200)):(ae({type:"UPDATE_FIELD",field:"ClientName",value:e[0].Name}),ae({type:"UPDATE_FIELD",field:"IDNo",value:e[0].IDNo}),ae({type:"UPDATE_FIELD",field:"subAcct",value:e[0].sub_account}),ae({type:"UPDATE_FIELD",field:"subAcctName",value:e[0].ShortName}),ae({type:"UPDATE_FIELD",field:"address",value:e[0].address}),mt(),setTimeout((function(){var e;null===(e=Le.current)||void 0===e||e.focus()}),200))},searchRef:Me}),pt=ut.ModalComponent,ht=ut.openModal,ft=ut.isLoading,mt=ut.closeModal,xt=(0,L.Z)({link:{url:"/task/accounting/general-journal/get-transaction-account",queryUrlName:"transactionCodeSearch"},columns:[{field:"Code",headerName:"Code",width:130},{field:"Description",headerName:"Description",flex:1}],queryKey:"get-transaction-account",uniqueId:"Code",responseDataKey:"getTransactionAccount",onSelected:function(e){ae({type:"UPDATE_FIELD",field:"TC_Code",value:e[0].Code}),ae({type:"UPDATE_FIELD",field:"TC_Desc",value:e[0].Description}),yt(),setTimeout((function(){var e;null===(e=ze.current)||void 0===e||e.focus()}),250)},searchRef:Me}),gt=xt.ModalComponent,bt=xt.openModal,vt=xt.isLoading,yt=xt.closeModal;(0,c.useEffect)((function(){var e=Ce.reduce((function(e,t){return e+parseFloat(t.debit.replace(/,/g,""))}),0),t=Ce.reduce((function(e,t){return e+parseFloat(t.credit.replace(/,/g,""))}),0);ae({type:"UPDATE_FIELD",field:"totalDebit",value:e.toFixed(2)}),ae({type:"UPDATE_FIELD",field:"totalCredit",value:t.toFixed(2)}),ae({type:"UPDATE_FIELD",field:"totalBalance",value:(e-t).toFixed(2)})}),[Ce]);var Dt=function(e){var t=e.target,n=t.name,i=t.value;ae({type:"UPDATE_FIELD",field:n,value:i})};function Nt(){return""===ie.refNo?w().fire({position:"center",icon:"warning",title:"Please provide reference number!",timer:1500}):""===ie.explanation?w().fire({position:"center",icon:"warning",title:"Please provide explanation!",timer:1500}).then((function(){(0,z.D)(300).then((function(){var e;null===(e=we.current)||void 0===e||e.focus()}))})):""===ie.totalDebit&&""===ie.totalCredit||"0.00"===ie.totalDebit&&"0.00"===ie.totalCredit?w().fire({position:"center",icon:"warning",title:"Total Debit and Credit amount must not be zero(0), please double check the entries",timer:1500}).then((function(){(0,z.D)(300).then((function(){}))})):ie.totalDebit!==ie.totalCredit?w().fire({position:"center",icon:"warning",title:"Total Debit and Credit amount must be balance, please double check the entries",timer:1500}).then((function(){(0,z.D)(300).then((function(){}))})):void("edit"===ie.cashMode?(0,W.s)({isUpdate:!0,cb:function(e){Oe({hasSelected:me,refNo:ie.refNo,dateEntry:ie.dateEntry,explanation:ie.explanation,particulars:ie.particulars,cashDisbursement:Ce,userCodeConfirmation:e})}}):(0,W.L)({isConfirm:function(){Oe({hasSelected:me,refNo:ie.refNo,dateEntry:ie.dateEntry,explanation:ie.explanation,particulars:ie.particulars,cashDisbursement:Ce})}}))}function Ct(){if(isNaN(parseFloat(ie.credit))&&(ie.credit="0.00"),isNaN(parseFloat(ie.debit))&&(ie.debit="0.00"),""===ie.code||""===ie.acctName)return dt(ie.code);if(""===ie.subAcctName||""===ie.ClientName)return ht(ie.ClientName);if(ie.credit===ie.debit)return w().fire({position:"center",icon:"warning",title:"The values for credit and debit must be different",timer:1500});if("1.01.10"===ie.code&&""===ie.checkNo)return w().fire({position:"center",icon:"warning",title:"Check No. is Required!",timer:1500});if(""===ie.TC_Code)return bt(ie.TC_Code);if(""===ie.Payto&&"1.01.10"===ie.code)return pe(!0),ht(ie.Payto);if(ie.code.length>=200)return w().fire({position:"center",icon:"warning",title:"Code is too long!",timer:1500});if(ie.ClientName.length>=200)return w().fire({position:"center",icon:"warning",title:"Client Name is too long!",timer:1500});if(ie.debit.length>=200)return w().fire({position:"center",icon:"warning",title:"Debit is too long!",timer:1500});if(ie.credit.length>=200)return w().fire({position:"center",icon:"warning",title:"Credit is too long!",timer:1500});if(ie.checkNo.length>=200)return w().fire({position:"center",icon:"warning",title:"Check No is too long!",timer:1500});if(ie.TC_Code.length>=200)return w().fire({position:"center",icon:"warning",title:"TC is too long!",timer:1500});if(ie.Payto.length>=200)return w().fire({position:"center",icon:"warning",title:"Pay to is too long!",timer:1500});if(ie.invoice.length>=200)return w().fire({position:"center",icon:"warning",title:"Invoice is too long!",timer:1500});function e(e){var t=e.length?e[e.length-1].TempID:"000";return(parseInt(t.toString().match(/\d+/)[0])+1).toString().padStart(3,"0")}w().fire({title:ve.edit?"Are you sure you want to update row?":"Are you sure you want to add new row?",text:"You won't be able to revert this!",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:ve.edit?"Yes, update it!":"Yes Add it"}).then((function(t){if(t.isConfirmed){Ze((function(t){if("1.01.10"===ie.code?ie.checkDate=function(e){var t=new Date(e),n=("0"+t.getDate()).slice(-2);return("0"+(t.getMonth()+1)).slice(-2)+"/"+n+"/"+t.getFullYear()}(ie.checkDate):ie.checkDate="","VAT"===ie.vatType&&"1.06.02"!==ie.code){var n;0!==parseFloat(ie.debit.replace(/,/g,""))?(n=parseFloat(ie.debit.replace(/,/g,""))/1.12,ie.debit=n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})):(n=parseFloat(ie.credit.replace(/,/g,""))/1.12,ie.credit=n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})),t=ve.edit?t.map((function(e){return ve.updateId===e.TempID&&(e=(0,d.Z)((0,d.Z)({},e),ie)),e})):[].concat((0,i.Z)(t),[(0,d.Z)((0,d.Z)({},ie),{},{TempID:e(t)})]);var a=.12*n;0!==parseFloat(ie.debit.replace(/,/g,""))?ie.debit=a.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):ie.credit=a.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),t=[].concat((0,i.Z)(t),[(0,d.Z)((0,d.Z)({},ie),{},{code:"1.06.02",acctName:"Input Tax",TempID:e(t)})])}else{var o=parseFloat(ie.credit.replace(/,/g,"")).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),r=parseFloat(ie.debit.replace(/,/g,"")).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});if(ie.credit=o,ie.debit=r,ve.edit)return t.map((function(e){return ve.updateId===e.TempID&&(e=(0,d.Z)((0,d.Z)({},e),ie)),e}));t=[].concat((0,i.Z)(t),[(0,d.Z)((0,d.Z)({},ie),{},{TempID:e(t)})])}return t}));var n={code:"",acctName:"",subAcct:"",subAcctName:"",IDNo:"",ClientName:"",credit:"",debit:"",TC_Code:"",TC_Desc:"",remarks:"",vatType:"NON-VAT",invoice:"",address:"",checkNo:"",checkDate:new Date};H(ae,(0,d.Z)((0,d.Z)({},ie),n)),ye({edit:!1,updateId:""}),(0,z.D)(300).then((function(){var e;null===(e=_e.current)||void 0===e||e.focus()}))}}))}var Zt,It=""===ie.cashMode;return(0,V.jsxs)("div",{style:{display:"flex",flexDirection:"column",width:"100%",height:"100%",flex:1},children:[(0,V.jsxs)("div",{style:{display:"flex",alignItems:"center",columnGap:"5px"},children:[(0,V.jsxs)("div",{style:{display:"flex",alignItems:"center",columnGap:"5px"},children:[at?(0,V.jsx)(I.Z,{loading:at}):(0,V.jsx)(s.Z,{label:"Search",size:"small",name:"search",value:ie.search,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),it(e.target.value)},InputProps:{style:{height:"27px",fontSize:"14px"}},sx:{width:"300px",height:"27px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),""===ie.cashMode&&(0,V.jsx)(u.Z,{sx:{height:"30px",fontSize:"11px"},variant:"contained",startIcon:(0,V.jsx)(j.Z,{sx:{width:15,height:15}}),id:"entry-header-save-button",onClick:function(){Dt({target:{value:"add",name:"cashMode"}})},color:"primary",children:"New"}),(0,V.jsx)(I.Z,{sx:{height:"30px",fontSize:"11px"},loading:Ve,disabled:""===ie.cashMode,onClick:Nt,color:"success",variant:"contained",children:"Save"}),""!==ie.cashMode&&(0,V.jsx)(I.Z,{sx:{height:"30px",fontSize:"11px"},variant:"contained",startIcon:(0,V.jsx)(E.Z,{sx:{width:15,height:15}}),color:"error",onClick:function(){w().fire({title:"Are you sure?",text:"You won't be able to revert this!",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Yes, cancel it!"}).then((function(e){e.isConfirmed&&(Ke(),Dt({target:{value:"",name:"cashMode"}}),H(ae,q),Ze([]),ye({edit:!1,updateId:""}))}))},disabled:""===ie.cashMode,children:"Cancel"}),(0,V.jsx)(I.Z,{sx:{height:"30px",fontSize:"11px",background:U.Z[500],":hover":{background:U.Z[600]}},onClick:function(){(0,W.s)({isUpdate:!1,text:"Are you sure you want to void ".concat(ie.refNo),cb:function(e){He({refNo:ie.refNo,dateEntry:ie.dateEntry,userCodeConfirmation:e})}})},loading:Qe,disabled:"edit"!==ie.cashMode,variant:"contained",startIcon:(0,V.jsx)(P.Z,{sx:{width:20,height:20}}),children:"Void"}),(0,V.jsx)(u.Z,{disabled:"edit"!==ie.cashMode,id:"basic-button","aria-haspopup":"true",onClick:function(){(0,O.flushSync)((function(){localStorage.removeItem("printString"),localStorage.setItem("dataString",JSON.stringify(Ce)),localStorage.setItem("paper-width","8.5in"),localStorage.setItem("paper-height","11in"),localStorage.setItem("module","cash-disbursement"),localStorage.setItem("state",JSON.stringify(ie)),localStorage.setItem("column",JSON.stringify([{datakey:"acctName",header:"ACCOUNT",width:"200px"},{datakey:"subAcctName",header:"SUB-ACCOUNT",width:"100px"},{datakey:"ClientName",header:"IDENTITY",width:"200px"},{datakey:"debit",header:"DEBIT",width:"100px"},{datakey:"credit",header:"CREDIT",width:"100px"}])),localStorage.setItem("title","UMIS"===(null===ee||void 0===ee?void 0:ee.department)?"UPWARD MANAGEMENT INSURANCE SERVICES\n":"UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.\n")})),window.open("/dashboard/print","_blank")},sx:{height:"30px",fontSize:"11px",color:"white",backgroundColor:B.Z[600],"&:hover":{backgroundColor:B.Z[700]}},children:"Print"})]}),(0,V.jsxs)("div",{style:{fontSize:"13px",border:"1px solid #d4d4d8",width:"100%",display:"flex",columnGap:"50px",height:"30px",alignItems:"center",justifyContent:"center"},children:[(0,V.jsxs)("p",{children:[(0,V.jsx)("span",{children:"Total Rows:"})," ",(0,V.jsx)("strong",{children:Ce.length})]}),(0,V.jsxs)("p",{children:[(0,V.jsx)("span",{children:"Total Debit:"})," ",(0,V.jsx)("strong",{children:ie.totalDebit})]}),(0,V.jsxs)("p",{children:[(0,V.jsx)("span",{children:"Total Credit:"})," ",(0,V.jsx)("strong",{children:ie.totalCredit})]}),(0,V.jsxs)("p",{children:[(0,V.jsx)("span",{children:"Balance:"})," ",(0,V.jsx)("strong",{style:{color:parseFloat(ie.totalBalance.replace(/,/g,""))>0?"red":"black"},children:ie.totalBalance})]})]})]}),(0,V.jsxs)("fieldset",{style:{border:"1px solid #cbd5e1",borderRadius:"5px",position:"relative",width:"100%",height:"auto",display:"flex",marginTop:"10px",gap:"10px",padding:"15px"},children:[Be?(0,V.jsx)(I.Z,{loading:Be}):(0,V.jsxs)(p.Z,{variant:"outlined",size:"small",disabled:It,sx:{width:"140px",".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},children:[(0,V.jsx)(h.Z,{htmlFor:"return-check-id-field",children:"Reference CV-"}),(0,V.jsx)(f.Z,{sx:{height:"27px",fontSize:"14px"},disabled:It,fullWidth:!0,label:"Reference CV-",name:"refNo",value:ie.refNo,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),Nt()},readOnly:"UCSMI"!==(null===ee||void 0===ee?void 0:ee.department),id:"return-check-id-field",endAdornment:(0,V.jsx)(m.Z,{position:"end",children:(0,V.jsx)(x.Z,{ref:Te,disabled:It,"aria-label":"search-client",color:"secondary",edge:"end",onClick:function(){Ke()},children:(0,V.jsx)(F.Z,{})})})})]}),(0,V.jsx)(Z.Z,{fullWidth:!1,disabled:It,label:"Date",onChange:function(e){ae({type:"UPDATE_FIELD",field:"dateEntry",value:e})},value:new Date(ie.dateEntry),onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)var t=setTimeout((function(){var e,n;null===(e=je.current)||void 0===e||null===(n=e.querySelector("button"))||void 0===n||n.click(),clearTimeout(t)}),150)},datePickerRef:je,textField:{InputLabelProps:{style:{fontSize:"14px"}},InputProps:{style:{height:"27px",fontSize:"14px",width:"150px"}}}}),(0,V.jsx)(s.Z,{disabled:It,label:"Explanation",size:"small",name:"explanation",value:ie.explanation,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),Nt()},inputRef:we,InputProps:{style:{height:"27px",fontSize:"14px"}},sx:{flex:1,height:"27px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),(0,V.jsx)(s.Z,{disabled:It,label:"Particulars",size:"small",name:"particulars",value:ie.particulars,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),Nt()},inputRef:Se,InputProps:{style:{height:"27px",fontSize:"14px"}},sx:{flex:1,height:"27px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}})]}),(0,V.jsxs)("fieldset",{style:{border:"1px solid #cbd5e1",borderRadius:"5px",position:"relative",width:"100%",height:"auto",marginTop:"10px",padding:"15px"},children:[(0,V.jsxs)("div",{style:{display:"flex",gap:"10px"},children:[ct?(0,V.jsx)(I.Z,{loading:ct}):(0,V.jsxs)(p.Z,{variant:"outlined",size:"small",disabled:It,sx:{width:"130px",".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},children:[(0,V.jsx)(h.Z,{htmlFor:"chart-account-id",children:"Code"}),(0,V.jsx)(f.Z,{sx:{height:"27px",fontSize:"14px"},readOnly:!0,disabled:It,fullWidth:!0,label:"Code",name:"code",inputRef:_e,value:ie.code,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),dt(ie.code)},id:"chart-account-id",endAdornment:(0,V.jsx)(m.Z,{position:"end",children:(0,V.jsx)(x.Z,{ref:Te,disabled:It,"aria-label":"search-client",color:"secondary",edge:"end",onClick:function(){dt(ie.code)},children:(0,V.jsx)(F.Z,{})})})})]}),(0,V.jsx)(s.Z,{disabled:It,label:"Account Name",size:"small",name:"acctName",value:ie.acctName,onChange:Dt,onKeyDown:function(e){return"Enter"===e.code||"NumpadEnter"===e.code&&""!==ie.acctName?(e.preventDefault(),Ct()):"Enter"===e.code||"NumpadEnter"===e.code&&""===ie.acctName?(e.preventDefault(),dt(ie.code)):void 0},InputProps:{style:{height:"27px",fontSize:"14px"}},sx:{flex:1,".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),(0,V.jsx)(s.Z,{disabled:It,label:"Sub Account",size:"small",name:"subAcctName",value:ie.subAcctName,onChange:Dt,onKeyDown:function(e){return"Enter"===e.code||"NumpadEnter"===e.code&&""!==ie.subAcctName?(e.preventDefault(),Ct()):"Enter"===e.code||"NumpadEnter"===e.code&&""===ie.subAcctName?(e.preventDefault(),ht(ie.ClientName)):void 0},InputProps:{style:{height:"27px",fontSize:"14px"}},sx:{width:"150px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),ft?(0,V.jsx)(I.Z,{loading:ft}):(0,V.jsxs)(p.Z,{variant:"outlined",size:"small",disabled:It,sx:{width:"300px",".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},children:[(0,V.jsx)(h.Z,{htmlFor:"policy-client-ref-id",children:"I.D"}),(0,V.jsx)(f.Z,{readOnly:!0,sx:{height:"27px",fontSize:"14px"},inputRef:Fe,disabled:It,fullWidth:!0,label:"I.D",name:"ClientName",value:ie.ClientName,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),pe(!1),ht(ie.ClientName)},id:"policy-client-ref-id",endAdornment:(0,V.jsx)(m.Z,{position:"end",children:(0,V.jsx)(x.Z,{ref:Te,disabled:It,"aria-label":"search-client",color:"secondary",edge:"end",onClick:function(){ht(ie.ClientName)},children:(0,V.jsx)(F.Z,{})})})})]}),(0,V.jsx)(s.Z,{disabled:It,label:"Debit",size:"small",name:"debit",value:ie.debit,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),Ct()},onBlur:function(e){e.preventDefault();var t="0";isNaN(parseFloat(ie.debit))||(t=ie.debit),ae({type:"UPDATE_FIELD",field:"debit",value:parseFloat(t.toString().replace(/,/g,"")).toFixed(2)})},InputProps:{inputComponent:A.a,inputRef:Le,style:{height:"27px",fontSize:"14px"}},sx:{width:"160px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),(0,V.jsx)(s.Z,{disabled:It,label:"Credit",size:"small",name:"credit",value:ie.credit,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),Ct()},onFocus:function(e){e.preventDefault(),"1.01.10"===ie.code&&ae({type:"UPDATE_FIELD",field:"credit",value:ie.totalBalance})},onBlur:function(e){e.preventDefault();var t="0";isNaN(parseFloat(ie.credit))||(t=ie.credit),ae({type:"UPDATE_FIELD",field:"credit",value:parseFloat(t.toString().replace(/,/g,"")).toFixed(2)})},InputProps:{inputComponent:A.a,style:{height:"27px",fontSize:"14px"}},sx:{width:"160px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),(0,V.jsx)(s.Z,{disabled:It||"1.01.10"!==ie.code,label:"Check No",size:"small",name:"checkNo",value:ie.checkNo,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),Ct()},InputProps:{style:{height:"27px",fontSize:"14px"}},sx:{width:"160px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}})]}),(0,V.jsxs)("div",{style:{display:"flex",gap:"10px",marginTop:"10px"},children:["1.01.10"===ie.code?(0,V.jsx)(Z.Z,{fullWidth:!1,disabled:It||"1.01.10"!==ie.code,label:"Check Date",onChange:function(e){ae({type:"UPDATE_FIELD",field:"checkDate",value:e})},value:ie.checkDate,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)var t=setTimeout((function(){var e,n;null===(e=Ee.current)||void 0===e||null===(n=e.querySelector("button"))||void 0===n||n.click(),clearTimeout(t)}),150)},datePickerRef:Ee,textField:{InputLabelProps:{style:{fontSize:"14px"}},InputProps:{style:{height:"27px",fontSize:"14px",width:"150px"}}}}):(0,V.jsx)(s.Z,{disabled:It||"1.01.10"!==ie.code,label:"Check Date",size:"small",name:"checkDate",InputProps:{style:{height:"27px",fontSize:"14px"}},sx:{width:"160px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),vt?(0,V.jsx)(I.Z,{loading:vt}):(0,V.jsxs)(p.Z,{variant:"outlined",size:"small",disabled:It,sx:{width:"130px",".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},children:[(0,V.jsx)(h.Z,{htmlFor:"tc",children:"TC"}),(0,V.jsx)(f.Z,{sx:{height:"27px",fontSize:"14px"},readOnly:!0,fullWidth:!0,label:"TC",name:"TC_Code",value:ie.TC_Code,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),bt(ie.TC_Code)},id:"tc",endAdornment:(0,V.jsx)(m.Z,{position:"end",children:(0,V.jsx)(x.Z,{ref:Te,disabled:It,"aria-label":"search-client",color:"secondary",edge:"end",onClick:function(){bt(ie.TC_Code)},children:(0,V.jsx)(F.Z,{})})})})]}),(0,V.jsx)(s.Z,{disabled:It,label:"Remarks",size:"small",name:"remarks",value:ie.remarks,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),Ct()},InputProps:{style:{height:"27px",fontSize:"14px"},inputRef:ze},sx:{flex:1,".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),"1.01.10"!==ie.code&&(0,V.jsx)(s.Z,{disabled:It,label:"Payto",size:"small",name:"Payto",value:ie.Payto,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),Ct()},InputProps:{readOnly:!0,style:{height:"27px",fontSize:"14px"}},sx:{width:"160px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),"1.01.10"===ie.code&&(0,V.jsx)(V.Fragment,{children:ft?(0,V.jsx)(I.Z,{loading:ft}):(0,V.jsxs)(p.Z,{variant:"outlined",size:"small",disabled:It,sx:{width:"300px",".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},children:[(0,V.jsx)(h.Z,{htmlFor:"policy-client-Payto",children:"Payto"}),(0,V.jsx)(f.Z,{readOnly:!0,sx:{height:"27px",fontSize:"14px"},inputRef:ke,disabled:It,fullWidth:!0,label:"Payto",name:"Payto",value:ie.Payto,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),pe(!0),ht(ie.Payto)},id:"policy-client-Payto",endAdornment:(0,V.jsx)(m.Z,{position:"end",children:(0,V.jsx)(x.Z,{ref:Te,disabled:It,color:"secondary",edge:"end",onClick:function(){ht(ie.Payto)},children:(0,V.jsx)(F.Z,{})})})})]})}),(0,V.jsxs)(p.Z,{size:"small",variant:"outlined",sx:{width:"120px",".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},children:[(0,V.jsx)(h.Z,{id:"label-selection-reason",children:"Vat Type"}),(0,V.jsxs)(g.Z,{labelId:"label-selection-reason",value:ie.vatType,name:"vatType",onChange:Dt,autoWidth:!0,sx:{height:"27px",fontSize:"14px"},inputRef:Ae,disabled:It,children:[(0,V.jsx)(b.Z,{value:"VAT",children:"VAT"}),(0,V.jsx)(b.Z,{value:"NON-VAT",children:"NON-VAT"})]})]}),(0,V.jsx)(s.Z,{disabled:It,label:"OR/Invoice No.",size:"small",name:"invoice",value:ie.invoice,onChange:Dt,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),Ct()},InputProps:{style:{height:"27px",fontSize:"14px"}},sx:{width:"200px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}})]})]}),(0,V.jsx)("div",{ref:Q,style:{marginTop:"10px",width:"100%",position:"relative",flex:1},children:(0,V.jsx)(v.Z,{style:{height:"".concat(null===(J=Q.current)||void 0===J?void 0:J.getBoundingClientRect().height,"px"),width:"100%",overflowX:"scroll",position:"absolute"},children:(0,V.jsx)(K.Z,{ref:Re,isLoading:Ve||et||Ge,columns:G,rows:(Zt=Ce,Zt.map((function(e){return e.debit=parseFloat(e.debit.toString().replace(/,/g,"")).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),e.credit=parseFloat(e.credit.toString().replace(/,/g,"")).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),e}))),table_id:"TempID",isSingleSelection:!0,isRowFreeze:!1,dataSelection:function(e,t,n){var i=t.filter((function(t){return t.TempID===e[0]}))[0];if(void 0===i||i.length<=0){var a={code:"",acctName:"",subAcct:"",subAcctName:"",IDNo:"",ClientName:"",credit:"",debit:"",TC_Code:"",TC_Desc:"",remarks:"",vatType:"NON-VAT",invoice:"",checkNo:"",checkDate:new Date};return H(ae,(0,d.Z)((0,d.Z)({},ie),a)),void ye({edit:!1,updateId:""})}"Delete"!==n&&"Backspace"!==n?(H(ae,(0,d.Z)((0,d.Z)({},i),{},{checkDate:new Date(i.checkDate),sub_refNo:ie.sub_refNo,refNo:ie.refNo,dateEntry:ie.dateEntry,explanation:ie.explanation,particulars:ie.particulars,totalDebit:ie.totalDebit,totalCredit:ie.totalCredit,totalBalance:ie.totalBalance})),ye({edit:!0,updateId:i.TempID})):w().fire({title:"Are you sure you want to delete?",text:"You won't be able to revert this!",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Yes, delete it!"}).then((function(t){if(t.isConfirmed)return Ze((function(t){return t.filter((function(t){return t.TempID!==e[0]}))}))}))}})})}),(0,V.jsx)(y.Z,{open:le,onClose:function(){return de(!1)},children:(0,V.jsxs)(v.Z,{sx:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:470,bgcolor:"background.paper",p:4},children:[(0,V.jsx)(x.Z,{style:{position:"absolute",top:"10px",right:"10px"},"aria-label":"search-client",onClick:function(){return de(!1)},children:(0,V.jsx)(E.Z,{})}),(0,V.jsx)(D.Z,{id:"modal-modal-title",variant:"h6",component:"h2",sx:{marginBottom:"20px"},children:"Jobs"}),(0,V.jsxs)("div",{style:{width:"400px"},children:[(0,V.jsxs)("div",{style:{width:"100%",display:"flex",marginBottom:"10px",justifyContent:"space-between",alignItems:"center"},children:[(0,V.jsx)(M._,{dateAdapter:_.H,children:(0,V.jsx)(R.M,{sx:{width:"200px",".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},slotProps:{textField:{size:"small",name:"",InputLabelProps:{style:{fontSize:"14px"}},InputProps:{style:{height:"27px",fontSize:"14px"}}}},label:"Transaction Date: ",views:["month","year"],value:ie.jobTransactionDate,onChange:function(e){ae({type:"UPDATE_FIELD",field:"jobTransactionDate",value:e})}})}),(0,V.jsx)(N.Z,{sx:{height:"30px","& .MuiTypography-root":{fontSize:"14px"}},control:(0,V.jsx)(C.Z,{size:"small",checked:ie.jobAutoExp,onChange:function(e){ae({type:"UPDATE_FIELD",field:"jobAutoExp",value:!ie.jobAutoExp})}}),label:"Auto Explanation"})]}),(0,V.jsxs)(p.Z,{fullWidth:!0,size:"small",variant:"outlined",sx:{".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},children:[(0,V.jsx)(h.Z,{id:"label-selection-job-type",children:"Type of Job"}),(0,V.jsxs)(g.Z,{labelId:"label-selection-job-type",value:ie.jobType,name:"jobType",onChange:Dt,autoWidth:!0,sx:{height:"27px",fontSize:"14px"},children:[(0,V.jsx)(b.Z,{value:"",children:" "}),(0,V.jsx)(b.Z,{value:"0",children:"Reversal of Accrued Interest "}),(0,V.jsxs)(b.Z,{value:"1",children:[" ","Income Recognition & Accrual of Interest"]}),(0,V.jsx)(b.Z,{value:"2",children:"Penalty Charges"}),(0,V.jsx)(b.Z,{value:"3",children:"Penalty Income"}),(0,V.jsx)(b.Z,{value:"4",children:"RPT Transaction (NIL-HN)"}),(0,V.jsx)(b.Z,{value:"5",children:"RPT Transaction (AMIFIN)"}),(0,V.jsx)(b.Z,{value:"6",children:"RPT Income"}),(0,V.jsx)(b.Z,{value:"7",children:"Monthly Accrual Expenses"}),(0,V.jsx)(b.Z,{value:"8",children:"Monthly Accrual Income"}),(0,V.jsx)(b.Z,{value:"9",children:"Production (Milestone Guarantee)"}),(0,V.jsx)(b.Z,{value:"10",children:"Production (Liberty Insurance Co.)"}),(0,V.jsx)(b.Z,{value:"11",children:"Production (Federal Phoenix)"})]})]})]}),(0,V.jsxs)("div",{style:{display:"flex",columnGap:"30px",alignItems:"flex-end",marginTop:"20px"},children:[(0,V.jsx)(I.Z,{loading:Ge,color:"success",variant:"contained",onClick:function(){return Ye(ie)},children:"Create Job"}),(0,V.jsx)(u.Z,{color:"error",variant:"contained",onClick:function(){return de(!1)},children:"Cancel"})]})]})}),lt,pt,gt,nt]})}function H(e,t){Object.entries(t).forEach((function(t){var n=(0,r.Z)(t,2),i=n[0],a=n[1];e({type:"UPDATE_FIELD",field:i,value:a})}))}},42419:function(e,t,n){var i=n(64836);t.Z=void 0;var a=i(n(45649)),o=n(80184),r=(0,a.default)((0,o.jsx)("path",{d:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"}),"Add");t.Z=r},86753:function(e,t,n){var i=n(64836);t.Z=void 0;var a=i(n(45649)),o=n(80184),r=(0,a.default)((0,o.jsx)("path",{d:"M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6 0 2.97-2.17 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93 0-4.42-3.58-8-8-8zm-6 8c0-1.65.67-3.15 1.76-4.24L6.34 7.34C4.9 8.79 4 10.79 4 13c0 4.08 3.05 7.44 7 7.93v-2.02c-2.83-.48-5-2.94-5-5.91z"}),"RestartAlt");t.Z=r},95643:function(e,t){t.Z={50:"#fbe9e7",100:"#ffccbc",200:"#ffab91",300:"#ff8a65",400:"#ff7043",500:"#ff5722",600:"#f4511e",700:"#e64a19",800:"#d84315",900:"#bf360c",A100:"#ff9e80",A200:"#ff6e40",A400:"#ff3d00",A700:"#dd2c00"}}}]);
//# sourceMappingURL=1861.104b5ff2.chunk.js.map