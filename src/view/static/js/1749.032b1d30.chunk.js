(self.webpackChunkupward=self.webpackChunkupward||[]).push([[1749],{13784:function(e,t,n){"use strict";n.d(t,{Z:function(){return u}});var o=n(1413),i=n(45987),r=n(71652),a=n(93862),l=n(93777),c=n(80184),s=["label","name","onChange","value","onKeyDown","inputRef","datePickerRef","fullWidth","textField","minWidth"];function u(e){var t=e.label,n=e.name,u=e.onChange,d=e.value,h=e.onKeyDown,f=e.inputRef,p=e.datePickerRef,v=e.fullWidth,m=e.textField,x=e.minWidth,g=void 0===x?"200px":x,C=(0,i.Z)(e,s);return(0,c.jsx)(r._,{dateAdapter:a.H,children:(0,c.jsx)(l.M,(0,o.Z)({value:d,onChange:u,ref:p,slotProps:{textField:(0,o.Z)({size:"small",label:t,name:n,onKeyDown:h,inputRef:f,fullWidth:v},m)},sx:{minWidth:g,".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}},C))})}},81582:function(e,t,n){"use strict";n.d(t,{XT:function(){return f},ZP:function(){return h},rO:function(){return p}});n(72791);var o=n(88447),i=n(64554),r=n(20890),a=n(48550),l=n(13400),c=n(29823),s=n(89767),u=n(80184),d={position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:"70%",bgcolor:"background.paper",boxShadow:24,p:4,heigth:"auto"};function h(e){var t=e.height,n=e.isLoading,h=(e.queryKey,e.columns),v=e.onSelectionChange,m=(e.setRows,e.rows),x=e.id,g=e.onCloseModal,C=e.showModal,w=e.onClickCloseIcon,y=e.searchOnChange,b=e.title,S=void 0===b?"":b,k=e.searchRef,D=(e.onCellKeyDown,e.onSearchKeyEnter),N=void 0===D?function(){}:D,R=e.isRowSelectable,Z=e.getCellClassName,j=f();return(0,u.jsx)(o.Z,{open:C,onClose:g,"aria-labelledby":"modal-modal-title","aria-describedby":"modal-modal-description",children:(0,u.jsxs)(i.Z,{sx:d,children:[(0,u.jsx)(r.Z,{id:"modal-modal-title",variant:"h6",component:"h2",mb:2,children:S}),(0,u.jsx)(a.Z,{size:"small",label:"Search",sx:{marginBottom:"10px"},fullWidth:!0,onChange:y,InputProps:{inputRef:k},onKeyDown:function(e){var t;"Enter"!==e.code&&"NumpadEnter"!==e.code||(e.preventDefault(),N(null===k||void 0===k||null===(t=k.current)||void 0===t?void 0:t.value));p(e,j,null===k||void 0===k?void 0:k.current)}}),(0,u.jsx)("div",{className:"".concat(j," main-table-selection-container"),style:{position:"relative",height:"".concat(t+20,"px")},children:(0,u.jsx)(s.Z,{isSingleSelection:!0,isRowFreeze:!1,columns:h,isLoading:n,dataSelection:function(e,t,n){v(e,t)},table_id:x,rows:m,isRowSelectable:R,getCellClassName:Z})}),(0,u.jsx)("div",{style:{position:"absolute",top:"10px",right:"10px"},children:(0,u.jsx)(l.Z,{"aria-label":"search-client",color:"secondary",onClick:w,children:(0,u.jsx)(c.Z,{})})})]})})}function f(){return"main-"+Math.floor(1e4*Math.random())}function p(e,t,n){var o=t;if("ArrowDown"===e.code){var i,r=document.querySelectorAll(".".concat(o," .MuiDataGrid-row"));e.preventDefault(),null===(i=r[0])||void 0===i||i.classList.add("hover-keyboard"),function(e,t){var n=document.querySelector(".".concat(e," .MuiDataGrid-row")),o=null===n||void 0===n?void 0:n.querySelector("input");null===o||void 0===o||o.focus();var i=new MouseEvent("mouseenter",{bubbles:!0,cancelable:!0,view:window});null===n||void 0===n||n.dispatchEvent(i),null===o||void 0===o||o.addEventListener("keydown",(function(e){"ArrowUp"===e.key&&(e.preventDefault(),t.focus()),"ArrowUp"===e.key&&(null===n||void 0===n||n.classList.remove("hover-keyboard"))}))}(t,n),r.forEach((function(e,t){e.addEventListener("keydown",(function(e){if("ArrowUp"===e.key){var n,o;if(t<=0)return;return e.preventDefault(),null===(n=r[t])||void 0===n||n.classList.remove("hover-keyboard"),void(null===(o=r[t-1])||void 0===o||o.classList.add("hover-keyboard"))}if("ArrowDown"===e.key){var i,a;if(e.preventDefault(),t>=r.length-1)return;null===(i=r[t])||void 0===i||i.classList.remove("hover-keyboard"),null===(a=r[t+1])||void 0===a||a.classList.add("hover-keyboard")}}))}))}}},89767:function(e,t,n){"use strict";var o=n(93433),i=n(1413),r=n(29439),a=n(72791),l=n(57482),c=n(64554),s=n(56214),u=n(29961),d=n(54277),h=n(70169),f=n(6484),p=n(16088),v=n(80184),m=(0,a.createContext)({rows:[],rowSelectionModel:[],footerChildren:function(){return(0,v.jsx)("div",{})},footerPaginationPosition:"right-left",showFooterSelectedCount:!0}),x=(0,a.forwardRef)((function(e,t){var n=e.isLoading,c=e.columns,u=e.rows,d=e.table_id,h=e.isSingleSelection,f=e.isRowFreeze,p=e.dataSelection,x=e.CustomFooterComponent,g=void 0===x?w:x,C=e.isRowSelectable,y=e.getCellClassName,b=e.checkboxSelection,S=void 0===b||b,k=e.footerChildren,D=void 0===k?function(e,t){return(0,v.jsx)("div",{})}:k,N=e.footerPaginationPosition,R=void 0===N?"right-left":N,Z=e.showFooterSelectedCount,j=void 0===Z||Z,A=(0,a.useState)([]),_=(0,r.Z)(A,2),T=_[0],F=_[1];function I(e,t,n){p&&p(e,t,n)}(0,a.useImperativeHandle)(t,(function(){return{removeSelection:function(){F([])},getSelectedRows:function(){return u.filter((function(e){return null===T||void 0===T?void 0:T.includes(e[d])}))},setSelectedRows:function(e){F(e)}}}));var O=[];return(0,v.jsx)(m.Provider,{value:{showFooterSelectedCount:j,footerPaginationPosition:R,rowSelectionModel:T,rows:u,footerChildren:D},children:(0,v.jsx)(s._$,{slots:{loadingOverlay:l.Z,footer:g},initialState:{pagination:{paginationModel:{pageSize:35}}},loading:n,getRowId:function(e){return e[d]},columns:c.filter((function(e){return!e.hide})),rows:u,showCellVerticalBorder:!0,showColumnVerticalBorder:!0,checkboxSelection:S,rowSelectionModel:T,rowHeight:25,columnHeaderHeight:35,pageSizeOptions:[10,20,35,50,75,100],sx:(0,i.Z)((0,i.Z)({"& .cash":{color:"#ec4899"},"& .check":{color:"#0891b2"},"& .approved":{color:"green"},"& .pending":{color:"orange"},"& .disapproved":{color:"red"},"& .normal":{color:"red"},"& .MuiDataGrid-row.Mui-selected:hover":{color:"black","& .MuiSvgIcon-root ":{fill:"#3b82f6"}},"& .hover-keyboard":{background:"#2563eb",color:"white","& .MuiSvgIcon-root ":{fill:"white"}},"& .MuiDataGrid-row:hover":{background:"#2563eb",color:"white","& .MuiSvgIcon-root ":{fill:"white"}},"& .MuiDataGrid-row.hover":{background:"#2563eb",color:"white","& .MuiSvgIcon-root ":{fill:"white"}},"& .MuiTablePagination-root p ":{padding:"0 !important"}},{"& .MuiDataGrid-columnHeaders":{background:"#64748b",color:"white",fontSize:"14px"},"& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer .MuiSvgIcon-root ":{display:h||f?"none":"block",fill:"white"},"& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer input ":{display:h||f?"none":"block"}}),{fontSize:13,fontWeight:500,"& .MuiDataGrid-checkboxInput":{height:"27px",width:"27px"},"& .MuiDataGrid-checkboxInput svg":{height:"20px",width:"20px"}}),onRowSelectionModelChange:function(e){if(f){if(e.length<=0)return;if(O=e,T.includes(O[O.length-1]))return;return F(e),void I([e[e.length-1]],u,null)}if(!f&&h)if(T&&(null===T||void 0===T?void 0:T.length)>0){var t=new Set(T);F(e.filter((function(e){return!t.has(e)})))}else F(e);else F(e);I([e[e.length-1]],u,null)},onCellKeyDown:function(e,t){if(["NumpadEnter","Enter","Delete","Backspace"].includes(t.code))return t.preventDefault(),"Enter"===t.code||"NumpadEnter"===t.code?h&&!f?F((function(n){return n&&n.length>0&&n[0]===e.rowNode.id?(I([],u,t.code),[]):(I([e.rowNode.id],u,t.code),[e.rowNode.id])})):void F((function(n){return n&&!f&&n.length>0&&n.includes(e.rowNode.id)?(n=n.filter((function(t){return t!==e.rowNode.id})),I([],u,t.code),n):n&&f&&n.length>0&&n.includes(e.rowNode.id)?n:(I([e.rowNode.id],u,t.code),[].concat((0,o.Z)(n),[e.rowNode.id]))})):"Delete"===t.code||"Backspace"===t.code?(F([e.rowNode.id]),I([e.rowNode.id],u,t.code)):void 0},disableVirtualization:!0,isRowSelectable:C,getCellClassName:y})})}));function g(e){var t=e.page,n=e.onPageChange,o=e.className,i=(0,u.l)(),r=(0,d.P)(i,h.UB);return(0,v.jsx)(p.Z,{variant:"outlined",color:"primary",className:o,count:r,page:t+1,onChange:function(e,t){n(e,t-1)}})}function C(e){return(0,v.jsx)(f.x,(0,i.Z)({ActionsComponent:g},e))}function w(e){var t=(0,a.useContext)(m),n=t.rowSelectionModel,o=t.showFooterSelectedCount,r=t.footerPaginationPosition,l=t.footerChildren,s=t.rows;return(0,v.jsxs)(c.Z,{sx:{columnGap:"50px",display:"flex",width:"100%",justifyContent:"space-between",px:3,alignItems:"center",flexDirection:"right-left"===r?"row-reverse":"row"},children:[(0,v.jsx)(C,(0,i.Z)({},e)),(0,v.jsxs)(c.Z,{sx:{display:"flex",justifyContent:"right-left"===r?"flex-start":"flex-end",flex:1,alignItems:"center"},children:[o&&(0,v.jsxs)("div",{children:["Selected:",null===n||void 0===n?void 0:n.length]}),(0,v.jsx)("div",{children:l(n,s)})]})]})}t.Z=x},26929:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return z},reducer:function(){return L}});var o=n(93433),i=n(74165),r=n(15861),a=n(29439),l=n(4942),c=n(1413),s=n(72791),u=n(91933),d=n(3380),h=n(48550),f=n(36151),p=n(68096),v=n(94925),m=n(77196),x=n(63466),g=n(13400),C=n(64554),w=n(13784),y=n(93263),b=n(99422),S=n(39709),k=n(86753),D=n(42419),N=n(53329),R=n(29823),Z=n(21830),j=n.n(Z),A=n(16395),_=n(25756),T=n(89767),F=n(64230),I=n(80184),O=[{value1:"1,000.00",value2:"",value3:"0.00"},{value1:"500.00",value2:"",value3:"0.00"},{value1:"200.00",value2:"",value3:"0.00"},{value1:"100.00",value2:"",value3:"0.00"},{value1:"50.00",value2:"",value3:"0.00"},{value1:"20.00",value2:"",value3:"0.00"},{value1:"10.00",value2:"",value3:"0.00"},{value1:"5.00",value2:"",value3:"0.00"},{value1:"2.00",value2:"",value3:"0.00"},{value1:"1.00",value2:"",value3:"0.00"},{value1:".50",value2:"",value3:"0.00"},{value1:".25",value2:"",value3:"0.00"},{value1:".10",value2:"",value3:"0.00"},{value1:".05",value2:"",value3:"0.00"},{value1:".01",value2:"",value3:"0.00"}],B=[{title:"Cash Collection",index:0},{title:"Check Collection",index:1},{title:"Selected Collection",index:2},{title:"Collection for Deposit",index:3}],M={depositSlip:"",temp_depositSlip:"",depositdate:new Date,Account_ID:"",Account_Name:"",Account_No:"",Account_Type:"",Desc:"",IDNo:"",Short:"",ShortName:"",Sub_ShortName:"",Sub_Acct:"",search:"",depositMode:"",Identity:""},L=function(e,t){return"UPDATE_FIELD"===t.type?(0,c.Z)((0,c.Z)({},e),{},(0,l.Z)({},t.field,t.value)):e},E=(0,s.createContext)({cashCollection:[],setCashCollection:function(){},checkCollection:[],setCheckCollection:function(){},selectedCollection:[],setSelectedCollection:function(){},collectionForDeposit:[],setCollectionForDeposit:function(){},tableRows:[],updateTableRowsInput:function(){},LoadingCashTable:!1,LoadingCheckTable:!1,setTotal:function(){},total:"0.00",TotalCashForDeposit:"0.00",loadingSearchByDepositSlip:!1});function z(){var e,t,n,l,C,Z,T=(0,s.useReducer)(L,M),z=(0,a.Z)(T,2),G=z[0],H=z[1],V=(0,s.useContext)(d.V),X=V.myAxios,J=V.user,Y=(0,_.Z)([(0,I.jsx)(W,{}),(0,I.jsx)(K,{}),(0,I.jsx)(q,{}),(0,I.jsx)(U,{})]),$=Y.currentStepIndex,ee=Y.step,te=Y.goTo,ne=(0,s.useState)(O),oe=(0,a.Z)(ne,2),ie=oe[0],re=oe[1],ae=(0,s.useState)([]),le=(0,a.Z)(ae,2),ce=le[0],se=le[1],ue=(0,s.useState)([]),de=(0,a.Z)(ue,2),he=de[0],fe=de[1],pe=(0,s.useState)([]),ve=(0,a.Z)(pe,2),me=ve[0],xe=ve[1],ge=(0,s.useState)([]),Ce=(0,a.Z)(ge,2),we=Ce[0],ye=Ce[1],be=(0,u.useQueryClient)(),Se=(0,u.useQuery)({queryKey:"cash",queryFn:function(){return(e=e||(0,r.Z)((0,i.Z)().mark((function e(){return(0,i.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,X.get("/task/accounting/getCashCollection",{headers:{Authorization:"Bearer ".concat(null===J||void 0===J?void 0:J.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},refetchOnWindowFocus:!1,onSuccess:function(e){se(e.data.cash)}}),ke=Se.isLoading,De=Se.refetch,Ne=(0,u.useQuery)({queryKey:"deposit-slipcode",queryFn:function(){return(t=t||(0,r.Z)((0,i.Z)().mark((function e(){return(0,i.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,X.get("/task/accounting/get-deposit-slipcode",{headers:{Authorization:"Bearer ".concat(null===J||void 0===J?void 0:J.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},refetchOnWindowFocus:!1,onSuccess:function(e){var t=e;"UCSMI"!==(null===J||void 0===J?void 0:J.department)&&(H({type:"UPDATE_FIELD",field:"depositSlip",value:t.data.slipcode[0].collectionID}),H({type:"UPDATE_FIELD",field:"temp_depositSlip",value:t.data.slipcode[0].collectionID}))}}),Re=Ne.isLoading,Ze=Ne.refetch,je=(0,u.useQuery)({queryKey:"check",queryFn:function(){return(n=n||(0,r.Z)((0,i.Z)().mark((function e(){return(0,i.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,X.get("/task/accounting/getCheckCollection",{headers:{Authorization:"Bearer ".concat(null===J||void 0===J?void 0:J.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},refetchOnWindowFocus:!1,onSuccess:function(e){fe(e.data.check)}}),Ae=je.isLoading,_e=je.refetch,Te=(0,s.useState)("0.00"),Fe=(0,a.Z)(Te,2),Ie=Fe[0],Oe=Fe[1],Be=(0,s.useRef)(null),Me=(0,s.useRef)(null),Le=(0,s.useRef)(null),Ee=(0,s.useRef)(null),ze=((0,s.useRef)(te),me.reduce((function(e,t){return e+(t.Check_No||""!==t.Check_No?0:parseFloat(t.Amount.replace(/,/g,"")))}),0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})),Pe=(0,y.Z)({link:{url:"/task/accounting/getBanks",queryUrlName:"bankDepositSearch"},columns:[{field:"Account_Type",headerName:"Account_Type",width:200},{field:"Account_No",headerName:"Account_No",width:170},{field:"Account_Name",headerName:"Account_Name",flex:1}],queryKey:"bank-deposit",uniqueId:"Account_No",responseDataKey:"banks",onSelected:function(e){console.log(e[0]);var t=(0,c.Z)((0,c.Z)({},G),e[0]);Q(H,t),Ue()},searchRef:Me}),We=Pe.ModalComponent,Ke=Pe.openModal,qe=Pe.isLoading,Ue=Pe.closeModal,Ge=(0,u.useMutation)({mutationKey:"add-deposit",mutationFn:function(e){return(l=l||(0,r.Z)((0,i.Z)().mark((function e(t){return(0,i.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,X.post("/task/accounting/add-deposit",t,{headers:{Authorization:"Bearer ".concat(null===J||void 0===J?void 0:J.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},onSuccess:function(e){var t=e;return t.data.success?(be.invalidateQueries("deposit-search"),Q(H,M),xe([]),ye([]),De(),Ze(),_e(),re(O),j().fire({position:"center",icon:"success",title:t.data.message,timer:1500})):j().fire({position:"center",icon:"warning",title:t.data.message,timer:1500})}}),He=Ge.mutate,Qe=Ge.isLoading,Ve=(0,u.useMutation)({mutationKey:"update-deposit",mutationFn:function(e){return(C=C||(0,r.Z)((0,i.Z)().mark((function e(t){return(0,i.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,X.post("/task/accounting/update-deposit",t,{headers:{Authorization:"Bearer ".concat(null===J||void 0===J?void 0:J.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},onSuccess:function(e){var t=e;return t.data.success?(be.invalidateQueries("deposit-search"),Q(H,M),xe([]),ye([]),De(),Ze(),_e(),re(O),j().fire({position:"center",icon:"success",title:t.data.message,timer:1500})):j().fire({position:"center",icon:"warning",title:t.data.message,timer:1500})}}),Xe=Ve.mutate,Je=Ve.isLoading,Ye=(0,u.useMutation)({mutationKey:"search-deposit-cash-check",mutationFn:function(e){return(Z=Z||(0,r.Z)((0,i.Z)().mark((function e(t){return(0,i.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,X.post("/task/accounting/search-cash-check",t,{headers:{Authorization:"Bearer ".concat(null===J||void 0===J?void 0:J.accessToken)}});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},onSuccess:function(e){var t=e;console.log("asdasd",t),se(t.data.cash),fe(t.data.check),xe([].concat((0,o.Z)(t.data.cash.filter((function(e){return""!==e.SlipCode}))),(0,o.Z)(t.data.check.filter((function(e){return""!==e.SlipCode}))))),ye((0,o.Z)(t.data.check.filter((function(e){return""!==e.SlipCode})))),re(t.data.cashBreakDownToArray),Q(H,(0,c.Z)((0,c.Z)({},G),t.data.getBankFromDeposit[0])),Oe(t.data.cashBreakDownTotal),at({target:{name:"depositMode",value:"edit"}})}}),$e=Ye.mutate,et=Ye.isLoading,tt=(0,y.Z)({link:{url:"/task/accounting/search-deposit",queryUrlName:"searchDeposit"},columns:[{field:"Date",headerName:"Date",width:150},{field:"SlipCode",headerName:"Slip Code",width:170},{field:"BankAccount",headerName:"Bank Account",width:170},{field:"AccountName",headerName:"Account Name",flex:1}],queryKey:"deposit-search",uniqueId:"SlipCode",responseDataKey:"deposit",onSelected:function(e){var t=e[0].SlipCode,n=e[0].BankAccount;$e({SlipCode:t,BankAccount:n}),H({type:"UPDATE_FIELD",field:"depositSlip",value:t}),G.depositSlip=t,rt()},onCloseFunction:function(e){H({type:"UPDATE_FIELD",field:"search",value:e})},searchRef:Le}),nt=tt.ModalComponent,ot=tt.openModal,it=tt.isLoading,rt=tt.closeModal,at=function(e){var t=e.target,n=t.name,o=t.value;H({type:"UPDATE_FIELD",field:n,value:o})},lt=function(e){return e.preventDefault(),G.Account_ID.length>=200?j().fire({position:"center",icon:"warning",title:"Bank Account is too long!",timer:1500}):""===G.Account_ID?j().fire({position:"center",icon:"warning",title:"Please provide bank account",timer:1500}).then((function(e){(0,A.wait)(350).then((function(){Ke()}))})):me.length<=0?j().fire({position:"center",icon:"warning",title:"No selected collection to be deposit",timer:1500}):ze.trim()!==Ie.trim()?j().fire({position:"center",icon:"warning",title:"Cash breakdown is not balance",timer:1500}):void("edit"===G.depositMode?(0,F.s)({isUpdate:!0,cb:function(e){Xe((0,c.Z)((0,c.Z)({},G),{},{userCodeConfirmation:e,selectedCollection:JSON.stringify(me),tableRowsInputValue:JSON.stringify(ie)}))}}):(0,F.L)({isConfirm:function(){He((0,c.Z)((0,c.Z)({},G),{},{selectedCollection:JSON.stringify(me),tableRowsInputValue:JSON.stringify(ie)}))}}))},ct=""===G.depositMode;return(0,I.jsxs)("div",{style:{display:"flex",flexDirection:"column",width:"100%",height:"100%",flex:1},children:[(0,I.jsxs)("div",{style:{display:"flex",alignItems:"center",columnGap:"5px"},children:[it?(0,I.jsx)(S.Z,{loading:it}):(0,I.jsx)(h.Z,{label:"Search",size:"small",name:"search",value:G.search,onChange:at,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return e.preventDefault(),ot(e.target.value)},InputProps:{style:{height:"27px",fontSize:"14px"}},sx:{width:"300px",height:"27px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),ct&&(0,I.jsx)(f.Z,{sx:{height:"30px",fontSize:"11px"},variant:"contained",startIcon:(0,I.jsx)(D.Z,{sx:{width:15,height:15}}),id:"entry-header-save-button",onClick:function(){at({target:{name:"depositMode",value:"add"}})},children:"New"}),(0,I.jsx)(S.Z,{sx:{height:"30px",fontSize:"11px"},id:"save-entry-header",color:"primary",variant:"contained",type:"submit",onClick:lt,disabled:ct,startIcon:(0,I.jsx)(N.Z,{sx:{width:15,height:15}}),loading:Je||Qe,children:"Save"}),!ct&&(0,I.jsx)(f.Z,{sx:{height:"30px",fontSize:"11px"},variant:"contained",startIcon:(0,I.jsx)(R.Z,{sx:{width:15,height:15}}),color:"error",onClick:function(){j().fire({title:"Are you sure?",text:"You won't be able to revert this!",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Yes, cancel it!"}).then((function(e){e.isConfirmed&&(M.depositMode="",Q(H,M),xe([]),ye([]),De(),Ze(),_e(),re(O))}))},children:"Cancel"})]}),(0,I.jsx)("br",{}),(0,I.jsxs)("form",{onKeyDown:function(e){"Enter"!==e.code&&"NumpadEnter"!==e.code||e.preventDefault()},style:{display:"flex",gap:"10px"},children:[Re?(0,I.jsx)(S.Z,{loading:Re}):(0,I.jsxs)(p.Z,{variant:"outlined",size:"small",disabled:ct,sx:{width:"200px",".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},children:[(0,I.jsx)(v.Z,{htmlFor:"deposit-id-field",children:"Slip Code"}),(0,I.jsx)(m.Z,{sx:{height:"27px",fontSize:"14px"},disabled:ct,fullWidth:!0,label:"Slip Code",name:"depositSlip",value:G.depositSlip,onChange:at,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return lt(e)},readOnly:"UCSMI"!==(null===J||void 0===J?void 0:J.department),id:"deposit-id-field",endAdornment:(0,I.jsx)(x.Z,{position:"end",children:(0,I.jsx)(g.Z,{disabled:ct,"aria-label":"search-client",color:"secondary",edge:"end",onClick:function(){Ze()},children:(0,I.jsx)(k.Z,{})})})})]}),(0,I.jsx)(w.Z,{disabled:ct,label:"Deposit Date",onChange:function(e){H({type:"UPDATE_FIELD",field:"depositdate",value:e})},value:new Date(G.depositdate),onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)var t=setTimeout((function(){var e,n;null===(e=Be.current)||void 0===e||null===(n=e.querySelector("button"))||void 0===n||n.click(),clearTimeout(t)}),150)},textField:{InputLabelProps:{style:{fontSize:"14px"}},InputProps:{style:{height:"27px",fontSize:"14px"}}},datePickerRef:Be}),qe?(0,I.jsx)(S.Z,{loading:qe}):(0,I.jsxs)(p.Z,{sx:{width:"200px",".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},variant:"outlined",size:"small",disabled:ct,children:[(0,I.jsx)(v.Z,{htmlFor:"deposit-bank",children:"Bank Account"}),(0,I.jsx)(m.Z,{sx:{height:"27px",fontSize:"14px"},disabled:ct,label:"Bank Account",name:"Account_ID",value:G.Account_ID,onChange:at,onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return Ke(G.Account_ID)},id:"deposit-bank",endAdornment:(0,I.jsx)(x.Z,{position:"end",children:(0,I.jsx)(g.Z,{disabled:ct,"aria-label":"search-client",color:"secondary",edge:"end",onClick:function(){return Ke(G.Account_ID)},children:(0,I.jsx)(b.Z,{})})})})]}),(0,I.jsx)(h.Z,{disabled:ct,name:"Account_Name",onChange:at,value:G.Account_Name,label:"Account Name",size:"small",onKeyDown:function(e){if("Enter"===e.code||"NumpadEnter"===e.code)return lt(e)},InputProps:{style:{height:"27px",fontSize:"14px"},readOnly:!0},sx:{flex:1,".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),(0,I.jsx)("button",{ref:Ee,style:{display:"none"},type:"submit"})]}),(0,I.jsx)("br",{}),(0,I.jsx)("div",{children:(0,I.jsx)("div",{style:{display:"flex"},children:B.map((function(e,t){return(0,I.jsxs)("button",{style:{border:"none",outline:"none",backgroundColor:"rgba(51, 51, 51, 0.05)",borderWidth:"0",color:$===t?"#7e22ce":"#333333",cursor:"pointer",display:"inline-block",fontFamily:'"Haas Grot Text R Web", "Helvetica Neue", Helvetica, Arial, sans-serif',fontSize:"14px",fontWeight:"500",lineHeight:"20px",listStyle:"none",margin:"0",padding:"10px 12px",textAlign:"center",transition:"all 200ms",verticalAlign:"baseline",whiteSpace:"nowrap",userSelect:"none",touchAction:"manipulation",position:"relative",overflow:"hidden"},onClick:function(){return te(t)},children:[(0,I.jsx)("span",{style:{position:"absolute",top:0,bottom:0,left:0,right:0,background:"rgba(206, 214, 211, 0.18)",transition:"all 200ms",transform:P($,t)}}),e.title]},t)}))})}),(0,I.jsx)("br",{}),(0,I.jsx)(E.Provider,{value:{cashCollection:ce,setCashCollection:se,checkCollection:he,setCheckCollection:fe,selectedCollection:me,setSelectedCollection:xe,collectionForDeposit:we,setCollectionForDeposit:ye,tableRows:ie,updateTableRowsInput:function(e,t){re((function(n){return n.map((function(n,o){return t===o&&(n=(0,c.Z)((0,c.Z)({},n),e)),n}))}))},LoadingCashTable:ke,LoadingCheckTable:Ae,total:Ie,setTotal:Oe,TotalCashForDeposit:ze,loadingSearchByDepositSlip:et},children:(0,I.jsx)("div",{style:{display:"flex",flexDirection:"column",flex:1},id:"concatiner",children:ee})}),We,nt]})}function P(e,t){return e===t?"translateX(100%)":"translateX(0%)"}function W(){var e,t=(0,s.useContext)(E),n=t.cashCollection,i=t.LoadingCashTable,r=t.setSelectedCollection,a=t.selectedCollection,l=t.loadingSearchByDepositSlip,c=(0,s.useRef)(null);return(0,s.useEffect)((function(){var e;null===(e=c.current)||void 0===e||e.setSelectedRows(a.filter((function(e){return""===e.Check_No})).map((function(e){return e.TempOR})))}),[a,c,l]),(0,I.jsx)("div",{style:{flex:1,marginTop:"10px",width:"100%",position:"relative"},children:(0,I.jsx)(C.Z,{style:{height:"".concat(null===(e=document.getElementById("concatiner"))||void 0===e?void 0:e.getBoundingClientRect().height,"px"),width:"100%",overflowX:"scroll",position:"absolute"},children:(0,I.jsx)(T.Z,{ref:c,isLoading:i||l,columns:[{field:"OR_No",headerName:"OR No.",minWidth:170},{field:"OR_Date",headerName:"OR Date",minWidth:170},{field:"Amount",headerName:"Amount",minWidth:150,align:"right",cellClassName:"super-app-theme--cell"},{field:"Client_Name",headerName:"Client Name",flex:1,minWidth:400},{field:"Temp_OR",headerName:"Temp_OR",hide:!0}],rows:n,table_id:"Temp_OR",isSingleSelection:!0,isRowFreeze:!0,dataSelection:function(e,t,n){var i=t.filter((function(t){return t.Temp_OR===e[0]}))[0];if(!(void 0===i||i.length<=0)){var a={Deposit:"Cash",Check_No:"",Check_Date:"",Bank:"",Amount:i.Amount,Name:i.Client_Name,RowIndex:i.Temp_OR,DRCode:i.DRCode,ORNo:i.OR_No,DRRemarks:i.ORNo,IDNo:i.ID_No,TempOR:i.Temp_OR,Short:i.Short};r((function(e){return e=[].concat((0,o.Z)(e),[a])}))}}})})})}function K(){var e,t=(0,s.useContext)(E),n=t.checkCollection,i=t.LoadingCheckTable,r=t.setSelectedCollection,a=t.selectedCollection,l=t.setCollectionForDeposit,c=t.loadingSearchByDepositSlip,u=(0,s.useRef)(null);return(0,s.useEffect)((function(){var e;null===(e=u.current)||void 0===e||e.setSelectedRows(a.filter((function(e){return""!==e.Check_No})).map((function(e){return e.TempOR})))}),[a,u,c]),(0,I.jsx)("div",{style:{marginTop:"10px",width:"100%",position:"relative",flex:1},children:(0,I.jsx)(C.Z,{style:{height:"".concat(null===(e=document.getElementById("concatiner"))||void 0===e?void 0:e.getBoundingClientRect().height,"px"),width:"100%",overflowX:"scroll",position:"absolute"},children:(0,I.jsx)(T.Z,{ref:u,isLoading:i||c,columns:[{field:"OR_No",headerName:"OR No.",minWidth:170},{field:"OR_Date",headerName:"OR Date",minWidth:170},{field:"Check_No",headerName:"Check No",minWidth:170},{field:"Check_Date",headerName:"Check Date",minWidth:170},{field:"Amount",headerName:"Amount",minWidth:160,align:"right"},{field:"Bank_Branch",headerName:"Bank/Branch",minWidth:300},{field:"Client_Name",headerName:"Client Name",minWidth:300,flex:1},{field:"Temp_OR",headerName:"Temp_OR",hide:!0}],rows:n,table_id:"Temp_OR",isSingleSelection:!0,isRowFreeze:!0,dataSelection:function(e,t,n){var i=t.filter((function(t){return t.Temp_OR===e[0]}))[0];if(!(void 0===i||i.length<=0)){var a={Deposit:"Check",Check_No:i.Check_No,Check_Date:i.Check_Date,Bank:i.Bank_Branch,Amount:i.Amount,Name:i.Client_Name,RowIndex:i.Temp_OR,DRCode:i.DRCode,ORNo:i.OR_No,DRRemarks:i.DRRemarks,IDNo:i.ID_No,TempOR:i.Temp_OR,Short:i.Short};r((function(e){return e=[].concat((0,o.Z)(e),[a])}));var c={Bank:i.Bank_Branch,Check_No:i.Check_No,Amount:i.Amount,TempOR:i.Temp_OR};l((function(e){return e=[].concat((0,o.Z)(e),[c])}))}}})})})}function q(){var e,t=(0,s.useContext)(E),n=t.selectedCollection,o=t.setSelectedCollection,i=t.setCollectionForDeposit,r=t.loadingSearchByDepositSlip,a=(0,s.useRef)(null);return(0,I.jsx)("div",{style:{marginTop:"10px",width:"100%",position:"relative",flex:1},children:(0,I.jsx)(C.Z,{style:{height:"".concat(null===(e=document.getElementById("concatiner"))||void 0===e?void 0:e.getBoundingClientRect().height,"px"),width:"100%",overflowX:"scroll",position:"absolute"},children:(0,I.jsx)(T.Z,{ref:a,isLoading:r,columns:[{field:"Deposit",headerName:"Deposit",flex:1,minWidth:170},{field:"Check_No",headerName:"Check No",flex:1,minWidth:170},{field:"Check_Date",headerName:"Check Date",flex:1,minWidth:170},{field:"Bank",headerName:"Bank/Branch",flex:1,minWidth:200},{field:"Amount",headerName:"Amount",flex:1,minWidth:170},{field:"Name",headerName:"Client Name",flex:1,minWidth:400},{field:"RowIndex",headerName:"RowIndex",hide:!0},{field:"DRCode",headerName:"DRCode",hide:!0},{field:"ORNo",headerName:"ORNo",hide:!0},{field:"DRRemarks",headerName:"DRRemarks",hide:!0},{field:"IDNo",headerName:"IDNo",hide:!0},{field:"TempOR",headerName:"TempOR",hide:!0},{field:"Short",headerName:"Short",hide:!0}],rows:n,table_id:"TempOR",isSingleSelection:!0,isRowFreeze:!1,dataSelection:function(e,t,n){var r=t.filter((function(t){return t.TempOR===e[0]}))[0];void 0===r||r.length<=0||(o((function(t){return t.filter((function(t){return t.TempOR!==e[0]}))})),i((function(t){return t.filter((function(t){return t.TempOR!==e[0]}))})))},getCellClassName:function(e){return"Deposit"===e.field&&"Cash"===e.value?"cash":"Deposit"===e.field&&"Check"===e.value?"check":""}})})})}function U(){var e=(0,s.useContext)(E),t=e.collectionForDeposit,n=e.tableRows,o=e.total,i=e.setTotal,r=e.TotalCashForDeposit,a=(0,s.useRef)(null);return(0,s.useEffect)((function(){i(n.reduce((function(e,t){return e+parseFloat(t.value3.replace(/,/g,""))}),0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}))}),[n,i]),(0,I.jsxs)("div",{style:{display:"flex",gap:"10px",height:"auto "},children:[(0,I.jsxs)("fieldset",{style:{flexDirection:"column",gap:"10px",padding:"15px",border:"1px solid #cbd5e1",borderRadius:"5px",width:"60%",position:"relative"},children:[(0,I.jsx)("legend",{children:"Checks"}),(0,I.jsx)("div",{style:{marginTop:"10px",width:"100%",position:"relative"},children:(0,I.jsx)(C.Z,{style:{height:"530px",width:"100%",overflowX:"scroll",position:"absolute"},children:(0,I.jsx)(T.Z,{ref:a,isLoading:!1,checkboxSelection:!1,columns:[{field:"Bank",headerName:"Bank/Branch",flex:1,minWidth:170},{field:"Check_No",headerName:"Check No",flex:1,minWidth:170},{field:"Amount",headerName:"Amount",flex:1,minWidth:170}],rows:t,table_id:"TempOR",isSingleSelection:!0,isRowFreeze:!1,isRowSelectable:function(){return!1},footerChildren:function(){return(0,I.jsx)(H,{})},footerPaginationPosition:"left-right",showFooterSelectedCount:!1})})})]}),(0,I.jsxs)("fieldset",{style:{flexDirection:"column",gap:"10px",padding:"15px",border:"1px solid #cbd5e1",borderRadius:"5px",alignSelf:"flex-end",display:"flex",width:"40%"},children:[(0,I.jsxs)("legend",{style:{color:o===r?"green":"#ec4899"},children:["Cash ( ",r," )"]}),(0,I.jsxs)("table",{style:{border:"2px solid black",borderCollapse:"collapse",marginTop:"10px",width:"100%"},children:[(0,I.jsxs)("colgroup",{children:[(0,I.jsx)("col",{style:{width:"140px"}}),(0,I.jsx)("col",{style:{width:"100px"}}),(0,I.jsx)("col",{style:{width:"140px"}})]}),(0,I.jsx)("thead",{children:(0,I.jsxs)("tr",{style:{borderBottom:"2px solid black",fontSize:"14px"},children:[(0,I.jsx)("th",{style:{borderRight:"2px solid black"},children:"Denominations"}),(0,I.jsx)("th",{style:{borderRight:"2px solid black"},children:"QTY"}),(0,I.jsx)("th",{style:{borderRight:"2px solid black"},children:"Amount"})]})}),(0,I.jsx)("tbody",{children:n.map((function(e,t){return(0,I.jsx)(G,{value1:e.value1,value2:e.value2,value3:e.value3,idx:t},t)}))}),(0,I.jsx)("tfoot",{children:(0,I.jsx)("tr",{style:{borderTop:"2px solid black",height:"50px"},children:(0,I.jsx)("td",{colSpan:3,children:(0,I.jsx)("div",{style:{display:"flex",justifyContent:"flex-end",padding:"0 10px  "},children:(0,I.jsxs)("div",{style:{display:"flex",alignItems:"center",width:"250px"},children:[(0,I.jsx)("span",{style:{fontSize:"14px",marginRight:"5px"},children:"Total Cash Deposit:"}),(0,I.jsx)("input",{style:{fontWeight:"bold",border:"1px solid black",textAlign:"right",fontSize:"15px",width:"117px"},value:o,onChange:function(e){i(e.target.value)},readOnly:!0})]})})})})})]})]})]})}function G(e){var t=e.value1,n=e.value2,o=e.value3,i=e.idx,r=(0,s.useContext)(E).updateTableRowsInput,l=(0,s.useState)(t),c=(0,a.Z)(l,2),u=c[0],d=c[1],h=(0,s.useState)(n),f=(0,a.Z)(h,2),p=f[0],v=f[1],m=(0,s.useState)(o),x=(0,a.Z)(m,2),g=x[0],C=x[1],w={textAlign:"right",height:"28px",borderRight:"none",borderLeft:"none",borderTop:"none",outline:"none",borderBottom:"1px solid #cbd5e1",padding:"0 8px",width:"100%"};return(0,I.jsxs)("tr",{children:[(0,I.jsx)("td",{style:{borderRight:"2px solid black"},children:(0,I.jsx)("input",{type:"text",style:w,value:u,onChange:function(e){return d(e.target.value)},readOnly:!0})}),(0,I.jsx)("td",{style:{borderRight:"2px solid black",overflow:"hidden"},children:(0,I.jsx)("input",{style:w,value:p,onChange:function(e){var n=u;v(e.target.value),u.includes(",")&&(n=u.replace(/,/g,"").toString());var o=(parseFloat(n)*(isNaN(parseInt(e.target.value))?0:parseInt(e.target.value))).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});C(o),r({value1:t,value2:e.target.value,value3:o},i)}})}),(0,I.jsx)("td",{style:{borderRight:"2px solid black"},children:(0,I.jsx)("input",{type:"text",style:w,value:g,onChange:function(e){return C(e.target.value)},readOnly:!0})})]})}function H(){var e=(0,s.useContext)(E).collectionForDeposit;return(0,I.jsx)(C.Z,{sx:{px:2,py:1,display:"flex",justifyContent:"flex-end",borderTop:"2px solid #e2e8f0"},children:(0,I.jsxs)("strong",{children:["Total:"," ",e.reduce((function(e,t){return e+parseFloat(t.Amount.replace(/,/g,""))}),0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})]})})}function Q(e,t){Object.entries(t).forEach((function(t){var n=(0,a.Z)(t,2),o=n[0],i=n[1];e({type:"UPDATE_FIELD",field:o,value:i})}))}},25756:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});var o=n(29439),i=n(72791);function r(e){var t=(0,i.useState)(0),n=(0,o.Z)(t,2),r=n[0],a=n[1];return{step:e[r],goTo:function(e){a(e)},back:function(){a((function(e){return e<=0?e:e+1}))},next:function(){a((function(t){return t>=e.length-1?t:t+1}))},isFirstStep:0!==r,isLastStep:r===e.length-1,currentStepIndex:r}}},93263:function(e,t,n){"use strict";var o,i=n(29439),r=n(74165),a=n(15861),l=n(72791),c=n(91933),s=n(3380),u=n(81582),d=n(54164),h=n(80184);function f(e,t,n){return(o=o||(0,a.Z)((0,r.Z)().mark((function e(t,n,o){var i,a=arguments;return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return i=a.length>3&&void 0!==a[3]?a[3]:"",e.abrupt("return",t.get("".concat(null===o||void 0===o?void 0:o.url,"?").concat(null===o||void 0===o?void 0:o.queryUrlName,"=").concat(i),{headers:{Authorization:"Bearer ".concat(null===n||void 0===n?void 0:n.accessToken)}}));case 2:case"end":return e.stop()}}),e)})))).apply(this,arguments)}t.Z=function(e){var t,n,o=e.link,p=e.uniqueId,v=e.queryKey,m=e.responseDataKey,x=e.columns,g=e.onSelected,C=void 0===g?function(){}:g,w=e.onRemoveSelected,y=void 0===w?function(){}:w,b=e.onSuccess,S=void 0===b?function(){}:b,k=e.searchRef,D=e.onCellKeyDown,N=e.onCloseFunction,R=void 0===N?function(){}:N,Z=e.CustomizeAxios,j=void 0===Z?f:Z,A=e.isRowSelectable,_=e.getCellClassName,T=(0,l.useContext)(s.V),F=T.myAxios,I=T.user,O=(0,l.useState)(!1),B=(0,i.Z)(O,2),M=B[0],L=B[1],E=(0,l.useState)([]),z=(0,i.Z)(E,2),P=z[0],W=z[1];function K(){return(t=t||(0,a.Z)((0,r.Z)().mark((function e(){var t,n=arguments;return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=n.length>0&&void 0!==n[0]?n[0]:"",e.next=3,j(F,I,o,t);case 3:return e.abrupt("return",e.sent);case 4:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var q=(0,c.useQuery)({queryKey:v,queryFn:function(){return(n=n||(0,a.Z)((0,r.Z)().mark((function e(){return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,K();case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)},onSuccess:function(e){var t=e;W(t.data[m]),S(t)},refetchOnWindowFocus:!1}),U=q.isLoading,G=q.refetch;return{show:M,rows:P,isLoading:U,openModal:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";(0,d.flushSync)((function(){L(!0)})),null!==k&&void 0!==k&&k.current&&(k.current.value=e,K(e).then((function(e){if(null===e||void 0===e||!e.data.success)return alert("Error : ".concat(null===e||void 0===e?void 0:e.data.message));W(e.data[m]),null!==k&&void 0!==k&&k.current&&k.current.focus()})))},closeModal:function(){var e;(L(!1),R)&&R(null===k||void 0===k||null===(e=k.current)||void 0===e?void 0:e.value)},ModalComponent:(0,h.jsx)(u.ZP,{getCellClassName:_,searchRef:k,showModal:M,onCloseModal:function(){var e;(L(!1),R)&&R(null===k||void 0===k||null===(e=k.current)||void 0===e?void 0:e.value)},onClickCloseIcon:function(){var e;(L(!1),R)&&R(null===k||void 0===k||null===(e=k.current)||void 0===e?void 0:e.value)},searchOnChange:function(e){},onSearchKeyEnter:function(e){K(e).then((function(e){if(null===e||void 0===e||!e.data.success)return alert("Error : ".concat(null===e||void 0===e?void 0:e.data.message));W(e.data[m])}))},onCellKeyDown:D,height:300,isLoading:U,queryKey:v,columns:x,onSelectionChange:function(e,t){if(e.length<=0)return y(t);var n=new Set(e),o=t.filter((function(e){return n.has(e[p].toString())}));o.length<=0||C(o,t)},id:p,rows:P,setRows:W,isRowSelectable:A}),refetch:G}}},64230:function(e,t,n){"use strict";n.d(t,{L:function(){return c},s:function(){return l}});var o=n(74165),i=n(15861),r=n(21830),a=n.n(r);function l(e){var t;a().fire({title:"Are you sure!",html:null!==e&&void 0!==e&&e.text?null===e||void 0===e?void 0:e.text:e.isUpdate?"Are you sure you want to make this change?":"Are you sure you want to delete this?",icon:"warning",input:"text",inputAttributes:{autocapitalize:"off"},showCancelButton:!0,confirmButtonText:"Save",confirmButtonColor:"green",showLoaderOnConfirm:!0,preConfirm:function(n){return(t=t||(0,i.Z)((0,o.Z)().mark((function t(n){return(0,o.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:try{e.cb(n)}catch(o){a().showValidationMessage("\n            Request failed: ".concat(o,"\n          "))}case 1:case"end":return t.stop()}}),t)})))).apply(this,arguments)},allowOutsideClick:function(){return!a().isLoading()}}).then((function(t){if(t.isConfirmed&&e.isConfirm)return e.isConfirm();e.isDeclined&&e.isDeclined()}))}function c(e){a().fire({title:"Are you sure?",text:null!==e&&void 0!==e&&e.text?null===e||void 0===e?void 0:e.text:"Do you want to proceed with saving?",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Yes, save it!"}).then((function(t){if(t.isConfirmed&&e.isConfirm)return e.isConfirm();e.isDeclined&&e.isDeclined()}))}},24654:function(){},45987:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});var o=n(63366);function i(e,t){if(null==e)return{};var n,i,r=(0,o.Z)(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}}}]);
//# sourceMappingURL=1749.032b1d30.chunk.js.map