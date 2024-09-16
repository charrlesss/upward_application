"use strict";(self.webpackChunkupward=self.webpackChunkupward||[]).push([[2890],{13784:function(t,e,n){n.d(e,{Z:function(){return c}});var i=n(1413),o=n(45987),r=n(71652),a=n(93862),l=n(93777),d=n(80184),s=["label","name","onChange","value","onKeyDown","inputRef","datePickerRef","fullWidth","textField"];function c(t){var e=t.label,n=t.name,c=t.onChange,u=t.value,h=t.onKeyDown,x=t.inputRef,p=t.datePickerRef,g=t.fullWidth,f=t.textField,m=(0,o.Z)(t,s);return(0,d.jsx)(r._,{dateAdapter:a.H,children:(0,d.jsx)(l.M,(0,i.Z)({value:u,onChange:c,ref:p,slotProps:{textField:(0,i.Z)({size:"small",label:e,name:n,onKeyDown:h,inputRef:x,fullWidth:g},f)},sx:{minWidth:"200px",".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}},m))})}},23508:function(t,e,n){n.d(e,{bq:function(){return l}});var i,o=n(74165),r=n(15861);function a(t){var e=t.data,n=t.column,i=t.beforeArrangeData,o=t.adjustMaxHeight,r=t.fontSize,a=void 0===r?"11px":r,l=t.summaryHeight,d=void 0===l?0:l,s=[],c=0,u=[],h=document.querySelector(".content").getBoundingClientRect().height-o;return e.forEach((function(t,o){t=i(t);var r=document.querySelector(".content"),l=document.createElement("table"),x=l.insertRow();t.summaryReport&&h-c<=d+20&&(c+=h-c),n.forEach((function(e){var n=x.insertCell();l.style.visibility="hidden",l.style.width="100%",l.style.fontSize=a,function(t,e,n,i,o){t.style.width=n,t.textContent=e,i.appendChild(o)}(n,t[e.datakey],e.width,r,l)})),c+=x.getBoundingClientRect().height,r.removeChild(l),u.push(t),(c>=h||o===e.length-1&&c<h)&&(s.push(u),c=0,u=[])})),s}var l=function(t){return(i=i||(0,r.Z)((0,o.Z)().mark((function t(e){var n,i,r,l,d,s,c,u;return(0,o.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(n=e.data,i=e.column,r=e.beforeArrangeData,l=e.adjustMaxHeight,d=e.cb,s=e.fontSize,c=void 0===s?"11px":s,u=e.summaryHeight,void 0!==n){t.next=3;break}return t.abrupt("return",[]);case 3:if(!d){t.next=5;break}return t.abrupt("return",d({data:n,column:i,beforeArrangeData:r,adjustMaxHeight:l}));case 5:return t.abrupt("return",a({data:n,column:i,beforeArrangeData:r,adjustMaxHeight:l,fontSize:c,summaryHeight:u}));case 6:case"end":return t.stop()}}),t)})))).apply(this,arguments)}},1870:function(t,e,n){n.r(e),n.d(e,{default:function(){return w},reducer:function(){return I}});var i=n(74165),o=n(15861),r=n(4942),a=n(1413),l=n(72791),d=n(48550),s=n(64554),c=n(68096),u=n(94925),h=n(58406),x=n(23786),p=n(91933),g=n(3380),f=n(13784),m=n(39709),y=n(93862),b=n(71652),_=n(93777),j=n(71012),S=n(23508),v=n(16386),k=n(58340),A=n(80184),C={dateFormat:"Monthly",date:new Date,sub_acct:"All",title:""},I=function(t,e){return"UPDATE_FIELD"===e.type?(0,a.Z)((0,a.Z)({},t),{},(0,r.Z)({},e.field,e.value)):t},Z=[{datakey:"nDate_Entry",header:"DATE",width:"80px"},{datakey:"nSource_No",header:"REF NO.",width:"90px"},{datakey:"cID_No",header:"IDENTITY",width:"300px"},{datakey:"Check_Bank",header:"BANK",width:"200px"},{datakey:"Check_No",header:"CHECK #",width:"100px"},{datakey:"Check_Return",header:"DATE RETURNED",width:"100px"},{datakey:"Check_Reason",header:"CHECK REASON",width:"100px"},{type:"number",datakey:"Debit",header:"DEBIT",width:"100px"},{type:"number",datakey:"Credit",header:"CREDIT",width:"100px"}];function z(t,e){return"".concat("UMIS"===e?"UPWARD MANAGEMENT INSURANCE SERVICES":"UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.","\n").concat(t.dateFormat," Returned Collections\n").concat(function(t){var e="";"Daily"===t.dateFormat?e=t.date.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"Monthly"===t.dateFormat&&(e=t.date.toLocaleDateString("en-US",{year:"numeric",month:"long"}));return e.toString()}(t))}function D(t){var e,n=t.state,a=t.dispatch,j=(0,l.useRef)(null),S=(0,l.useContext)(g.V),v=S.myAxios,k=S.user,C=(0,p.useQuery)({queryKey:"sub-accounts",queryFn:function(){return(e=e||(0,o.Z)((0,i.Z)().mark((function t(){return(0,i.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,v.get("/reports/accounting/get-sub-account-acronym",{headers:{Authorization:"Bearer ".concat(null===k||void 0===k?void 0:k.accessToken)}});case 2:return t.abrupt("return",t.sent);case 3:case"end":return t.stop()}}),t)})))).apply(this,arguments)}}),I=C.data,Z=C.isLoading,D=function(t){var e=t.target,n=e.name,i=e.value;a({type:"UPDATE_FIELD",field:n,value:i})};return(0,A.jsxs)("div",{style:{padding:"50px 20px"},children:[(0,A.jsx)(d.Z,{label:"Title",fullWidth:!0,name:"title",value:n.title,onChange:D,rows:6,multiline:!0,InputProps:{style:{height:"140px",fontSize:"12px"}},sx:{flex:1,".MuiFormLabel-root":{fontSize:"14px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}}}),(0,A.jsxs)(s.Z,{sx:function(t){return(0,r.Z)({height:"100%",display:"grid",gridTemplateColumns:"repeat(1,1fr)",gap:"10px",margin:"10px 0"},t.breakpoints.down("sm"),{gridTemplateColumns:"repeat(1,1fr)"})},children:[(0,A.jsxs)(c.Z,{fullWidth:!0,variant:"outlined",size:"small",sx:{".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},children:[(0,A.jsx)(u.Z,{id:"date_format",children:"Report"}),(0,A.jsxs)(h.Z,{labelId:"date_format",value:n.dateFormat,label:"Report",name:"dateFormat",onChange:function(t){D(t),n.dateFormat=t.target.value,a({type:"UPDATE_FIELD",field:"title",value:z(n,null===k||void 0===k?void 0:k.department)})},sx:{height:"27px",fontSize:"14px"},children:[(0,A.jsx)(x.Z,{value:"Daily",children:"Daily"}),(0,A.jsx)(x.Z,{value:"Monthly",children:"Monthly"})]})]}),Z?(0,A.jsx)(m.Z,{loading:Z}):(0,A.jsxs)(c.Z,{fullWidth:!0,variant:"outlined",size:"small",sx:{".MuiFormLabel-root":{fontSize:"14px",background:"white",zIndex:99,padding:"0 3px"},".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},children:[(0,A.jsx)(u.Z,{id:"sub_account_id",children:"Sub Account"}),(0,A.jsxs)(h.Z,{labelId:"sub_account_id",value:n.sub_acct,label:"Sub Account",name:"sub_acct",onChange:D,sx:{height:"27px",fontSize:"14px"},children:[(0,A.jsx)(x.Z,{value:"All",children:"All"}),null===I||void 0===I?void 0:I.data.sub_account.map((function(t,e){return(0,A.jsx)(x.Z,{value:t.Acronym,children:t.Acronym},e)}))]})]}),"Monthly"===n.dateFormat&&(0,A.jsx)(b._,{dateAdapter:y.H,children:(0,A.jsx)(_.M,{sx:{width:"100%",".MuiFormLabel-root[data-shrink=false]":{top:"-5px"}},slotProps:{textField:{size:"small",name:"",InputLabelProps:{style:{fontSize:"14px"}},InputProps:{style:{height:"27px",fontSize:"14px"}}}},label:"Date",views:["month","year"],value:n.date,onChange:function(t){a({type:"UPDATE_FIELD",field:"date",value:t}),n.date=t,a({type:"UPDATE_FIELD",field:"title",value:z(n,null===k||void 0===k?void 0:k.department)})}})}),"Daily"===n.dateFormat&&(0,A.jsx)(f.Z,{fullWidth:!0,label:"Date From",onChange:function(t){a({type:"UPDATE_FIELD",field:"date",value:t}),n.date=t,a({type:"UPDATE_FIELD",field:"title",value:z(n,null===k||void 0===k?void 0:k.department)})},value:new Date(n.date),onKeyDown:function(t){if("Enter"===t.code||"NumpadEnter"===t.code)var e=setTimeout((function(){var t,n;null===(t=j.current)||void 0===t||null===(n=t.querySelector("button"))||void 0===n||n.click(),clearTimeout(e)}),150)},datePickerRef:j,textField:{InputLabelProps:{style:{fontSize:"14px"}},InputProps:{style:{height:"27px",fontSize:"14px"}}}})]})]})}function w(){var t,e=(0,l.useContext)(g.V),n=e.user,r=e.myAxios;return C.title=z(C,null===n||void 0===n?void 0:n.department),(0,A.jsx)(j.ZP,{column:Z,initialState:C,Setting:function(t,e){return(0,A.jsx)(D,{state:t,dispatch:e})},onReportSubmit:function(e,a,d){return(t=t||(0,o.Z)((0,i.Z)().mark((function t(e,o,a){var d,s,c,u,h,x;return(0,i.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,r.post("/reports/accounting/return-checks-collection",a,{headers:{Authorization:"Bearer ".concat(null===n||void 0===n?void 0:n.accessToken)}});case 2:return d=t.sent,t.next=5,d.data;case 5:s=t.sent,c=function(){return(0,A.jsx)("table",{children:(0,A.jsx)("tbody",{children:s.summary.map((function(t,e){return!t.summ||t.header||t.footer||t.signature?t.summ&&t.header?(0,A.jsx)(l.Fragment,{children:(0,A.jsxs)("tr",{children:[(0,A.jsx)("td",{colSpan:3,style:{fontSize:"11.5px",fontWeight:"bolder",textAlign:"right"}}),(0,A.jsx)("td",{colSpan:2,style:{fontSize:"11.5px",fontWeight:"bolder",textAlign:"center"},children:t.Check_Bank}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11.5px",fontWeight:"bolder",textAlign:"left"},children:t.Debit}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11.5px",fontWeight:"bolder",textAlign:"left"},children:t.Credit})]})},e):t.summ&&t.footer?(0,A.jsx)(l.Fragment,{children:(0,A.jsxs)("tr",{children:[(0,A.jsx)("td",{colSpan:3,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"right"}}),(0,A.jsx)("td",{colSpan:2,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"right"},children:t.Check_Bank}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"right",borderTop:"1px solid black",borderBottom:"2px solid black"},children:t.Debit}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"right",borderTop:"1px solid black",borderBottom:"2px solid black"},children:t.Credit})]})},e):t.summ&&t.signature?(0,A.jsxs)(l.Fragment,{children:[(0,A.jsx)("tr",{style:{height:"40px"}}),(0,A.jsx)("tr",{children:(0,A.jsx)("td",{colSpan:Z.length,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"center"},children:"Prepared: ________________ \xa0\xa0\xa0\xa0\xa0 Checked: ________________ \xa0\xa0\xa0\xa0\xa0Approved: ________________"})})]},e):t.summary?(0,A.jsxs)(l.Fragment,{children:[(0,A.jsx)("tr",{style:{height:"15px"}}),(0,A.jsx)("tr",{children:(0,A.jsx)("td",{colSpan:3,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"right"},children:t.cID_No})}),(0,A.jsx)("tr",{style:{height:"15px"}})]},e):t.follows?(0,A.jsxs)(l.Fragment,{children:[(0,A.jsx)("tr",{style:{height:"10px"}}),(0,A.jsx)("tr",{children:(0,A.jsx)("td",{colSpan:Z.length,style:{fontSize:"11px",fontWeight:"500",textAlign:"center"},children:t.Check_No})})]},e):(0,A.jsx)(l.Fragment,{},e):(0,A.jsx)(l.Fragment,{children:(0,A.jsxs)("tr",{children:[(0,A.jsx)("td",{colSpan:3,style:{fontSize:"11px",fontWeight:"500",textAlign:"right"}}),(0,A.jsx)("td",{colSpan:2,style:{fontSize:"11px",fontWeight:"500",textAlign:"left"},children:t.Check_Bank}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11px",fontWeight:"500",textAlign:"right"},children:t.Debit}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11px",fontWeight:"500",textAlign:"right"},children:t.Credit})]})},e)}))})})},u=k.renderToString((0,A.jsx)(c,{})),(h=document.createElement("div")).innerHTML=u,document.body.appendChild(h),x=h.getBoundingClientRect().height,document.body.removeChild(h),(0,S.bq)({data:s.report,column:Z,beforeArrangeData:function(t){return t},adjustMaxHeight:400,summaryHeight:x-100}).then((function(t){e(t),o(!1)}));case 14:case"end":return t.stop()}}),t)})))).apply(this,arguments)},scaleDefaultValue:90,drawTable:function(t,e){return t.map((function(n,i){return(0,A.jsxs)("div",{className:"page out-page",children:[(0,A.jsx)("div",{className:"header",style:{height:"50px"}}),(0,A.jsx)("div",{className:"content",children:(0,A.jsxs)("table",{children:[(0,A.jsxs)("thead",{children:[e.title.split("\n").map((function(t,e){return(0,A.jsx)("tr",{children:(0,A.jsx)("th",{style:{fontSize:"14px",fontWeight:"bold",textAlign:"left"},colSpan:Z.length,children:t})},e)})),(0,A.jsx)("tr",{style:{height:"40px"}}),(0,A.jsx)("tr",{children:Z.map((function(e,n){return(0,A.jsx)("th",{onDoubleClick:function(n){return(0,j.PE)(n,e.datakey,t)},style:{width:e.width,fontSize:"10.5px",fontWeight:"bold",textAlign:"left"},children:e.header},n)}))})]}),(0,A.jsx)("tbody",{children:n.map((function(t,e){return!t.summ||t.header||t.footer||t.signature?t.summ&&t.header?(0,A.jsx)(l.Fragment,{children:(0,A.jsxs)("tr",{children:[(0,A.jsx)("td",{}),(0,A.jsx)("td",{}),(0,A.jsx)("td",{colSpan:2,style:{fontSize:"11.5px",fontWeight:"bolder",textAlign:"center",paddingLeft:"20px"},children:t.Check_Bank}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11.5px",fontWeight:"bolder",textAlign:"left"},children:t.Debit}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11.5px",fontWeight:"bolder",textAlign:"left"},children:t.Credit})]})},e):t.summ&&t.footer?(0,A.jsx)(l.Fragment,{children:(0,A.jsxs)("tr",{children:[(0,A.jsx)("td",{colSpan:2,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"right"}}),(0,A.jsx)("td",{colSpan:2,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"right"},children:t.Check_Bank}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"right",borderTop:"1px solid black",borderBottom:"2px solid black"},children:t.Debit}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"right",borderTop:"1px solid black",borderBottom:"2px solid black"},children:t.Credit})]})},e):t.summ&&t.signature?(0,A.jsxs)(l.Fragment,{children:[(0,A.jsx)("tr",{style:{height:"40px"}}),(0,A.jsx)("tr",{children:(0,A.jsx)("td",{colSpan:Z.length,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"center"},children:"Prepared: ________________ \xa0\xa0\xa0\xa0\xa0 Checked: ________________ \xa0\xa0\xa0\xa0\xa0Approved: ________________"})})]},e):t.summary?(0,A.jsxs)(l.Fragment,{children:[(0,A.jsx)("tr",{style:{height:"15px"}}),(0,A.jsx)("tr",{children:(0,A.jsx)("td",{colSpan:3,style:{fontSize:"11px",fontWeight:"bolder",textAlign:"center"},children:t.cID_No})}),(0,A.jsx)("tr",{style:{height:"15px"}})]},e):t.follows?(0,A.jsxs)(l.Fragment,{children:[(0,A.jsx)("tr",{style:{height:"10px"}}),(0,A.jsx)("tr",{children:(0,A.jsx)("td",{colSpan:Z.length,style:{fontSize:"11px",fontWeight:"500",textAlign:"center"},children:t.Check_No})})]},e):(0,A.jsx)("tr",{children:Z.map((function(n,o){return(0,A.jsx)(l.Fragment,{children:t.total&&"DRTitle"===n.datakey||t.total&&"CRTitle"===n.datakey?(0,A.jsx)(A.Fragment,{}):(0,A.jsx)("td",{onClick:j.mp,className:"editable not-looking page-".concat(i,"  row-").concat(e,"_col-").concat(o),style:{fontSize:"11px",fontWeight:t.total?"bold":"500",width:"".concat(n.width," !important"),textAlign:"number"===n.type?"right":"left",borderTop:t.total&&"Debit"===n.datakey||t.total&&"Credit"===n.datakey?"1px solid black":"",padding:"0 5px"},children:t[n.datakey]})},o)}))},e):(0,A.jsx)(l.Fragment,{children:(0,A.jsxs)("tr",{children:[(0,A.jsx)("td",{}),(0,A.jsx)("td",{}),(0,A.jsx)("td",{colSpan:2,style:{fontSize:"11px",fontWeight:"500",textAlign:"left",paddingLeft:"150px"},children:t.Check_Bank}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11px",fontWeight:"500",textAlign:"right"},children:t.Debit}),(0,A.jsx)("td",{colSpan:1,style:{fontSize:"11px",fontWeight:"500",textAlign:"right"},children:t.Credit})]})},e)}))})]})}),(0,A.jsxs)("div",{className:"footer",style:{height:"50px",display:"flex",justifyContent:"space-between"},children:[(0,A.jsx)("p",{style:{fontSize:"10px",fontWeight:"bold"},children:(0,v.Z)(new Date,"dd/MM/yyyy")}),(0,A.jsxs)("p",{style:{fontSize:"10px",fontWeight:"bold"},children:["Page ",i+1," of ",t.length]})]})]},i)}))},pageHeight:"8.5in",pageWidth:"13in"})}},39709:function(t,e,n){n.d(e,{Z:function(){return j}});var i=n(4942),o=n(63366),r=n(87462),a=n(72791),l=n(14036),d=n(67384),s=n(94419),c=n(66934),u=n(31402),h=n(36151),x=n(13239),p=n(21217);function g(t){return(0,p.Z)("MuiLoadingButton",t)}var f=(0,n(75878).Z)("MuiLoadingButton",["root","loading","loadingIndicator","loadingIndicatorCenter","loadingIndicatorStart","loadingIndicatorEnd","endIconLoadingEnd","startIconLoadingStart"]),m=n(80184),y=["children","disabled","id","loading","loadingIndicator","loadingPosition","variant"],b=(0,c.ZP)(h.Z,{shouldForwardProp:function(t){return function(t){return"ownerState"!==t&&"theme"!==t&&"sx"!==t&&"as"!==t&&"classes"!==t}(t)||"classes"===t},name:"MuiLoadingButton",slot:"Root",overridesResolver:function(t,e){return[e.root,e.startIconLoadingStart&&(0,i.Z)({},"& .".concat(f.startIconLoadingStart),e.startIconLoadingStart),e.endIconLoadingEnd&&(0,i.Z)({},"& .".concat(f.endIconLoadingEnd),e.endIconLoadingEnd)]}})((function(t){var e=t.ownerState,n=t.theme;return(0,r.Z)((0,i.Z)({},"& .".concat(f.startIconLoadingStart,", & .").concat(f.endIconLoadingEnd),{transition:n.transitions.create(["opacity"],{duration:n.transitions.duration.short}),opacity:0}),"center"===e.loadingPosition&&(0,i.Z)({transition:n.transitions.create(["background-color","box-shadow","border-color"],{duration:n.transitions.duration.short})},"&.".concat(f.loading),{color:"transparent"}),"start"===e.loadingPosition&&e.fullWidth&&(0,i.Z)({},"& .".concat(f.startIconLoadingStart,", & .").concat(f.endIconLoadingEnd),{transition:n.transitions.create(["opacity"],{duration:n.transitions.duration.short}),opacity:0,marginRight:-8}),"end"===e.loadingPosition&&e.fullWidth&&(0,i.Z)({},"& .".concat(f.startIconLoadingStart,", & .").concat(f.endIconLoadingEnd),{transition:n.transitions.create(["opacity"],{duration:n.transitions.duration.short}),opacity:0,marginLeft:-8}))})),_=(0,c.ZP)("span",{name:"MuiLoadingButton",slot:"LoadingIndicator",overridesResolver:function(t,e){var n=t.ownerState;return[e.loadingIndicator,e["loadingIndicator".concat((0,l.Z)(n.loadingPosition))]]}})((function(t){var e=t.theme,n=t.ownerState;return(0,r.Z)({position:"absolute",visibility:"visible",display:"flex"},"start"===n.loadingPosition&&("outlined"===n.variant||"contained"===n.variant)&&{left:"small"===n.size?10:14},"start"===n.loadingPosition&&"text"===n.variant&&{left:6},"center"===n.loadingPosition&&{left:"50%",transform:"translate(-50%)",color:(e.vars||e).palette.action.disabled},"end"===n.loadingPosition&&("outlined"===n.variant||"contained"===n.variant)&&{right:"small"===n.size?10:14},"end"===n.loadingPosition&&"text"===n.variant&&{right:6},"start"===n.loadingPosition&&n.fullWidth&&{position:"relative",left:-10},"end"===n.loadingPosition&&n.fullWidth&&{position:"relative",right:-10})})),j=a.forwardRef((function(t,e){var n=(0,u.Z)({props:t,name:"MuiLoadingButton"}),i=n.children,a=n.disabled,c=void 0!==a&&a,h=n.id,p=n.loading,f=void 0!==p&&p,j=n.loadingIndicator,S=n.loadingPosition,v=void 0===S?"center":S,k=n.variant,A=void 0===k?"text":k,C=(0,o.Z)(n,y),I=(0,d.Z)(h),Z=null!=j?j:(0,m.jsx)(x.Z,{"aria-labelledby":I,color:"inherit",size:16}),z=(0,r.Z)({},n,{disabled:c,loading:f,loadingIndicator:Z,loadingPosition:v,variant:A}),D=function(t){var e=t.loading,n=t.loadingPosition,i=t.classes,o={root:["root",e&&"loading"],startIcon:[e&&"startIconLoading".concat((0,l.Z)(n))],endIcon:[e&&"endIconLoading".concat((0,l.Z)(n))],loadingIndicator:["loadingIndicator",e&&"loadingIndicator".concat((0,l.Z)(n))]},a=(0,s.Z)(o,g,i);return(0,r.Z)({},i,a)}(z),w=f?(0,m.jsx)(_,{className:D.loadingIndicator,ownerState:z,children:Z}):null;return(0,m.jsxs)(b,(0,r.Z)({disabled:c||f,id:I,ref:e},C,{variant:A,classes:D,ownerState:z,children:["end"===z.loadingPosition?i:w,"end"===z.loadingPosition?w:i]}))}))},45987:function(t,e,n){n.d(e,{Z:function(){return o}});var i=n(63366);function o(t,e){if(null==t)return{};var n,o,r=(0,i.Z)(t,e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);for(o=0;o<a.length;o++)n=a[o],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(r[n]=t[n])}return r}}}]);
//# sourceMappingURL=2890.e9b3800e.chunk.js.map