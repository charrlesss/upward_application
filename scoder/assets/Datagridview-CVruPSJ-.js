import{c as l,r,j as e,H as a}from"./index-BYLl3OQl.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"m9 14 2 2 4-4",key:"df797q"}]],d=l("clipboard-check",c);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}]],x=l("clipboard",u),t=({code:o})=>{const[i,n]=r.useState(!1),s=()=>{navigator.clipboard.writeText(o).then(()=>{n(!0),setTimeout(()=>n(!1),2e3)})};return e.jsxs("div",{className:"relative bg-gray-900 text-white p-4 rounded-2xl shadow-md font-mono text-sm overflow-auto mb-2",children:[e.jsx("pre",{className:"whitespace-pre-wrap",children:o}),e.jsx("button",{style:{cursor:"pointer"},onClick:s,className:"absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white",children:i?e.jsx(d,{size:16}):e.jsx(x,{size:16})})]})},I=()=>e.jsxs(e.Fragment,{children:[e.jsxs(a,{children:[e.jsx("meta",{name:"description",content:`If you’re looking to recreate the classic DataGridView experience from VB.NET in a modern React web application, this post is for you. I built a lightweight, easy-to-use React table component that mimics VB.NET’s DataGridView — including features like row selection, unselection, deletion, resetting, and getting the selected row index. Perfect for developers transitioning desktop apps to the web!\r
\r
          Includes a working example and download link. Like, share, and subscribe to support the project!`}),e.jsx("meta",{name:"keywords",content:"react, datagridview, vb.net, react-table, data-table, web development, desktop to web, ui components, row selection, frontend, react component, custom table, vb.net to react"}),e.jsx("link",{rel:"canonical",href:"https://scode.shop/blogs/datagridview-react"}),e.jsx("title",{children:"VB.NET-Style DataGridView in React – Simple, Powerful, and Easy to Use"})]}),e.jsx("article",{children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 py-10",children:[e.jsxs("header",{children:[e.jsx("h1",{className:"text-3xl md:text-4xl font-bold text-black-600 mb-6",children:"🕵️ VB.NET-Style DataGridView in React – Simple, Powerful, and Easy to Use"}),e.jsx("p",{children:"By SCoder • July 4, 2025"})]}),e.jsx("p",{className:"text-gray-700 mb-6",children:"If you’re looking to recreate the classic DataGridView experience from VB.NET in a modern React web application, this post is for you. I built a lightweight, easy-to-use React table component that mimics VB.NET’s DataGridView — including features like row selection, unselection, deletion, resetting, and getting the selected row index. Perfect for developers transitioning desktop apps to the web! Includes a working example and download link. Like, share, and subscribe to support the project!"}),e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold text-black-600 mb-3",children:"Overview"}),e.jsx("p",{className:"text-gray-700 mb-3",children:"This React app creates a simple DataGridView-like table using a custom component DataGridViewReact. It fetches data from a public API and displays it in a grid, with features like:"}),e.jsxs("ul",{className:"list-disc list-inside text-gray-700",children:[e.jsx("li",{children:"Searching by ID,"}),e.jsx("li",{children:"Selecting rows,"}),e.jsx("li",{children:"Showing selected row details in input fields,"}),e.jsx("li",{children:"Getting the selected row’s index."})]})]}),e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold text-black-600 mb-3",children:"Breakdown"}),e.jsx("p",{className:"text-gray-700 mb-3",children:"1. Imports and Column Setup"}),e.jsx(t,{code:g}),e.jsxs("ul",{className:"list-disc list-inside text-gray-700",children:[e.jsx("li",{children:"Imports React hooks useEffect and useRef."}),e.jsx("li",{children:"Imports a custom table component DataGridViewReact."}),e.jsx("li",{children:"Defines columns that specify what data to show, labels, and their widths."})]})]}),e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold text-black-600 mb-3",children:"Refs to Control Components"}),e.jsx(t,{code:b}),e.jsxs("ul",{className:"list-disc list-inside text-gray-700",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"table"})," ref to access methods inside the table component (e.g., setData, getSelectedRow)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"albumIdRef "})," and ",e.jsx("strong",{children:"titleRef"})," to update input fields showing details of the selected row."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"getselectedRowRef"})," to show the selected row index when a button is clicked."]})]})]}),e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold text-black-600 mb-3",children:"Fetching Initial Data on Component Mount"}),e.jsx(t,{code:p}),e.jsxs("ul",{className:"list-disc list-inside text-gray-700",children:[e.jsx("li",{children:"When the component mounts ([] dependency), fetches photo data from the API."}),e.jsx("li",{children:"Sends the fetched data to the table via table.current.setData(data)."})]})]}),e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold text-black-600 mb-3",children:"Render Method (JSX)"}),e.jsx("h3",{className:"text-gray-700 mb-3",children:"a. Header and Search Box"}),e.jsx(t,{code:m}),e.jsxs("ul",{className:"list-disc list-inside text-gray-700",children:[e.jsx("li",{children:"Displays a search input field."}),e.jsx("li",{children:"On pressing Enter, fetches filtered data by id from the API or all data if empty."}),e.jsx("li",{children:"Updates the table with the fetched results."})]})]}),e.jsxs("section",{className:"mb-8",children:[e.jsx("h3",{className:"text-2xl font-semibold text-black-600 mb-3",children:"b. Input Fields for Selected Row Details"}),e.jsx(t,{code:f}),e.jsxs("ul",{className:"list-disc list-inside text-gray-700",children:[e.jsx("li",{children:"Two inputs to show the ID and Title of the selected row."}),e.jsx("li",{children:"They use refs to be updated programmatically."})]})]}),e.jsxs("section",{className:"mb-8",children:[e.jsx("h3",{className:"text-2xl font-semibold text-black-600 mb-3",children:"c. Button to Get Selected Row Index"}),e.jsx(t,{code:w}),e.jsxs("ul",{className:"list-disc list-inside text-gray-700",children:[e.jsx("li",{children:"A button triggers table.current.getSelectedRow() to get the index of the selected row."}),e.jsx("li",{children:"The result is shown in the input field next to it."})]})]}),e.jsxs("section",{className:"mb-8",children:[e.jsx("h3",{className:"text-2xl font-semibold text-black-600 mb-3",children:"d. The DataGridViewReact Table Component"}),e.jsx(t,{code:h}),e.jsxs("ul",{className:"list-disc list-inside text-gray-700",children:[e.jsx("li",{children:"The custom table component is rendered."}),e.jsx("li",{children:"Passes columns and a callback handleSelectionChange which fires whenever a row is selected or unselected."}),e.jsx("li",{children:"This callback updates the input fields to show the selected row’s id and title or clears them if no row is selected."}),e.jsxs("li",{children:[e.jsx("strong",{children:"adjustVisibleRowCount"})," likely controls how many rows are visible at once."]})]})]}),e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold text-black-600 mb-3",children:"Summary"}),e.jsxs("ul",{className:"list-disc list-inside text-gray-700",children:[e.jsx("li",{children:"This React app fetches photo data and displays it in a VB.NET-like DataGridView."}),e.jsx("li",{children:"Users can search for rows by ID."}),e.jsx("li",{children:"When a row is selected, its details appear in input fields."}),e.jsx("li",{children:"Users can also get the index of the selected row."}),e.jsx("li",{children:"The app uses React refs extensively to manipulate the table and inputs imperatively, simulating a desktop-like interaction style."})]})]}),e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold text-black-600 mb-3",children:"Component"}),e.jsx(t,{code:y}),e.jsx("a",{href:"../../../public/blog.zip ",className:"text-blue-600 hover:underline",children:"Downlaod Zip here."})]})]})})]}),h=`
<DataGridViewReact
  ref={table}
  adjustVisibleRowCount={220}
  columns={columns}
  handleSelectionChange={(rowItm: any) => {
    if (rowItm) {
      if (albumIdRef.current) {
        albumIdRef.current.value = rowItm.id;
      }
      if (titleRef.current) {
        titleRef.current.value = rowItm.title;
      }
    } else {
      if (albumIdRef.current) {
        albumIdRef.current.value = "";
      }
      if (titleRef.current) {
        titleRef.current.value = "";
      }
    }
  }}
/>
`,w=`
<div style={{marginLeft:"50px" ,display:"flex",columnGap:"5px"}}>
    <button onClick={()=>{
        if(getselectedRowRef.current){
          getselectedRowRef.current.value = table.current.getSelectedRow()
        }
    }}>Get Selected Row Index</button>
    <input
      ref={getselectedRowRef}
      type="search"
      style={{ width: "100px" }}
    />
  </div>
</div>
`,f=`
<div style={{ display: "flex", marginBottom: "5px" }}>
  <label style={{ width: "100px" }}> ID : </label>
  <input ref={albumIdRef} type="text" />
</div>
<div style={{ display: "flex" }}>
  <label style={{ width: "100px" }}>Title : </label>
  <input ref={titleRef} type="text" style={{ width: "500px" }} />
`,m=`
<h1 style={{ color: "blue" }}>DATAGRIDVIEW REACT</h1>
<div style={{ display: "flex", marginBottom: "25px" }}>
  <label style={{ width: "60px" }}>Search : </label>
  <input
    type="search"
    style={{ width: "500px" }}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        let link = "";
        if (e.currentTarget.value === "") {  link = \`https://jsonplaceholder.typicode.com/photos\`;
 } else {
    link = \`https://jsonplaceholder.typicode.com/photos?id=\${e.currentTarget.value}\`;
 }
        fetch(link)
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            table.current.setData(data);
          });
      }
    }}
  />
</div>`,p=`

  fetch("https://jsonplaceholder.typicode.com/photos")
    .then((response) => response.json())
    .then((data) => {
      table.current.setData(data);
    });
}, []);`,b=`
const table = useRef<any>(null);

const albumIdRef = useRef<HTMLInputElement>(null);
const titleRef = useRef<HTMLInputElement>(null);

const getselectedRowRef = useRef<HTMLInputElement>(null);
`,g=`
import { useEffect, useRef } from "react";
import DataGridViewReact from "./components/Datagridviewreact";

const columns = [
  { key: "albumId", label: "Album ID", width: 70 },
  { key: "id", label: "ID", width: 50 },
  { key: "title", label: "Title", width: 500 },
  { key: "url", label: "URL", width: 300 },
  { key: "thumbnailUrl", label: "Thumb Nail URL", width: 300 },
];
`,y=`import { 
  useState,
 forwardRef,
 useRef,
 useCallback,
 useEffect,
 useImperativeHandle,
 Fragment,
} from "react";
import '../style/datagridview.css';

const rowHeight = 20;
const buffer = 5;
const DataGridViewReact = forwardRef(
  (
    {
      columns,
      adjustVisibleRowCount = 100,
      RightClickComponent = (props: any) => {
        return <></>;
      },
      FooterComponent = (props: any) => {
        return <></>;
      },
      handleSelectionChange,
      onMaxScrollUp,
      adjustRightClickClientXAndY = { x: 0, y: 0 },
      adjustOnRezise = true,
      onDelete = (data: any) => {},
      beforeDelete = (data: any) => false,
      fixedRowCount = 0,
    }: any,
    ref
  ) => {
    let lastColIdx: any = null;
    const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
    const [selectAll, setSelectAll] = useState(false);
    const [rightClickRowIndex, setRightClickRowIndex] = useState<any>(null);                        
    const [rightClickColumnIndex, setRightClickColumnIndex] =
      useState<any>(null);
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [visibleRowCount, setVisibleRowCount] = useState(25);
    const [data, setData] = useState([]);
    const [column, setColumn] = useState([]);
    const totalRowWidth = column.reduce((a: any, b: any) => a + b.width, 0);
    const [columnHeader, setColumnHeader] = useState([
      {
        key: "checkbox",
        label: "",
        width: 25,
        freeze: true,
      },
      ...columns.filter((itm: any) => !itm.hide),
    ]);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);
    const resizingColIndexRef = useRef<number | null>(null);
    const [startIndex, setStartIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const cellRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const endIndex = Math.min(
      data.length,
      startIndex + visibleRowCount + buffer
    );

    const handleContextMenu = (e: React.MouseEvent, row: any, col: any) => {
      e.preventDefault();
      setRightClickRowIndex(row);
      setRightClickColumnIndex(col);
      const clickX = e.clientX - adjustRightClickClientXAndY.x;
      const clickY = e.clientY - adjustRightClickClientXAndY.y;

      setVisible(true);
      setPos({ x: clickX, y: clickY });
    };

    const handleClickCloseRightClickModal = () => {
      setVisible(false);
    };
    const handleCellKeyDown = (
      e: React.KeyboardEvent<HTMLDivElement>,
      rowIndex: number,
      colKey: string,
      row: any
    ) => {
      let targetRow = rowIndex;
      let colIndex = columnHeader.findIndex((col: any) => col.key === colKey);

      if (e.key === "Enter") {
        selectedRowAction(row);
      }

      if (e.code === "Delete" || e.code === "Backspace") {
        const confirm = window.confirm(
          "Are you sure you want to delete all the rows?"
        );
        if (confirm) {
          if (beforeDelete()) {
            return;
          }
          const newData = data.filter(
            (itm: any) => itm.rowIndex !== row.rowIndex
          );
          setData(newData);
          onDelete(newData);
        }
      }

      if (e.key === "ArrowUp" && targetRow === 0) {
        if (onMaxScrollUp) {
          onMaxScrollUp();
        }
      }

      if (e.key === "ArrowDown" && targetRow < data.length - 1) {
        targetRow++;
      } else if (e.key === "ArrowUp" && targetRow > 0) {
        targetRow--;
      } else if (e.key === "ArrowLeft" && colIndex > 0) {
        colIndex--;
      } else if (e.key === "ArrowRight" && colIndex < columnHeader.length - 1) {
        colIndex++;
      } else {
        return;
      }

      e.preventDefault();

      const nextKey = \`\${targetRow}-\${columnHeader[colIndex].key}\`;
      const nextEl = cellRefs.current[nextKey];

      // ⬇️ Focus the cell if it exists (might not if not yet rendered)
      if (nextEl) {
        nextEl.focus();
      }

      // 🔁 Scroll to row if it's not currently in view
      const scrollTop = containerRef.current?.scrollTop || 0;
      const containerHeight = containerRef.current?.clientHeight || 0;

      const rowTop = targetRow * rowHeight;
      const rowBottom = rowTop + rowHeight;

      if (rowTop < scrollTop) {
        // Scroll up
        containerRef.current?.scrollTo({ top: rowTop });
      } else if (rowBottom > scrollTop + containerHeight) {
        // Scroll down
        containerRef.current?.scrollTo({ top: rowBottom - containerHeight });
      }
    };
    const handleScroll = useCallback(() => {
      setVisible(false);
      const scrollTop = containerRef.current?.scrollTop || 0;
      const newStartIndex = Math.floor(scrollTop / rowHeight);
      setStartIndex(newStartIndex);
    }, []);

    useEffect(() => {
      if (columnHeader.length > 0) {
        setColumn([
          {
            key: "checkbox",
            label: "",
            width: 25,
            freeze: true,
          },
          ...columnHeader.filter((itm: any) => !itm.hide),
        ] as any);
      }
    }, [columnHeader]);
    useEffect(() => {
      if (fixedRowCount > 0) {
        return setVisibleRowCount(fixedRowCount);
      }

      const wH = window.innerHeight - adjustVisibleRowCount;
      const rowCount = Math.round(wH) / rowHeight;
      setVisibleRowCount(rowCount);

      const resize = () => {
        if (adjustOnRezise) {
          const wH = window.innerHeight - adjustVisibleRowCount;
          const rowCount = Math.round(wH) / rowHeight;
          setVisibleRowCount(rowCount);
        }
      };
      window.addEventListener("resize", resize);
      return () => {
        window.removeEventListener("resize", resize);
      };
    }, [adjustOnRezise, fixedRowCount]);
    useEffect(() => {
      if (visible && menuRef.current) {
        const menu = menuRef.current;
        const { innerWidth, innerHeight } = window;
        const rect = menu.getBoundingClientRect();
        let newX = pos.x;
        let newY = pos.y;

        if (rect.width + pos.x > innerWidth) {
          newX = innerWidth - rect.width - 10;
        }

        if (rect.height + pos.y > innerHeight) {
          newY = innerHeight - rect.height - 10;
        }

        if (newX !== pos.x || newY !== pos.y) {
          setPos({ x: newX, y: newY });
        }
      }
    }, [visible, pos]);
    useEffect(() => {
      window.addEventListener("click", handleClickCloseRightClickModal);
      return () => {
        window.removeEventListener("click", handleClickCloseRightClickModal);
      };
    }, []);

    const selectedRowAction = (row: any) => {
      const _row = data.filter((itm: any) => itm.rowIndex === row.rowIndex);
      if (selectedRow !== null) {
        if (selectedRow !== row.rowIndex) {
          setSelectedRow(row.rowIndex);
          handleSelectionChange(_row[0]);
        } else {
          setSelectedRow(null);
          handleSelectionChange(null);
        }
      } else {
        handleSelectionChange(_row[0]);
        setSelectedRow(row.rowIndex);
      }
    };
    const widening = (colIdx: number | null) => {
      if (colIdx) {
        lastColIdx = colIdx;
        const allColumn: any = [...document.querySelectorAll(\`.col-\${colIdx}\`)];
        allColumn.forEach((itm: HTMLDivElement) => {
          itm.style.borderRight = "2px solid #2344eb";
        });
        if (containerRef.current) {
          containerRef.current.classList.add("noselect");
        }
      } else {
        const allColumn: any = [
          ...document.querySelectorAll(\`.col-\${lastColIdx}\`),
        ];
        allColumn.forEach((itm: HTMLDivElement) => {
          itm.style.borderRight = "1px solid #ebe8e8";
        });
        if (containerRef.current) {
          containerRef.current.classList.remove("noselect");
        }
      }
    };
    const onMouseDown = (e: any, col: any, colIdx: number) => {
      startXRef.current = e.clientX;
      startWidthRef.current = col.width;
      resizingColIndexRef.current = colIdx;

      const onMouseMove = (e: MouseEvent) => {
        widening(colIdx);
        const delta = e.clientX - startXRef.current;
        const newWidth = Math.max(startWidthRef.current + delta, 50); // minimum 50px
        setColumnHeader((prev: any) =>
          prev.map((c: any, i: any) =>
            i === colIdx ? { ...c, width: newWidth } : c
          )
        );
      };

      const onMouseUp = () => {
        widening(null);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        resizingColIndexRef.current = null;
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
    const getFrozenLeft = (colIdx: number) => {
      let left = 0;
      for (let i = 0; i < colIdx; i++) {
        if (columnHeader[i].freeze) {
          left += columnHeader[i].width;
        }
      }
      return left;
    };

    useImperativeHandle(ref, () => ({
      getData: () => {
        const newData = [...data];
        return newData;
      },
      setData: (newData: any) => {
        setData(
          newData.map((itm: any, idx: number) => {
            return { ...itm, rowIndex: idx };
          })
        );
      },
      resetTable: () => {
        setData([]);
        setSelectedRow(null);
        setStartIndex(0);
      },
      getColumns: () => {
        return columns;
      },
      focusOnFirstRowColumn: () => {
        const firstCell = cellRefs.current[\`\${startIndex}-\${columns[0].key}\`];
        if (firstCell) {
          if (containerRef.current) {
            containerRef.current.style.overflowY = "hidden";
            if (containerRef.current)
              containerRef.current.style.overflowY = "auto";
          }

          firstCell.focus();
        }
      },
      focusOnLastRowColumn: () => {
        const lastRowIndex = data.length - 1;
        const d = Math.round(lastRowIndex - visibleRowCount);
        setStartIndex(d);
        // setSelectedRow(lastRowIndex);

        setTimeout(() => {
          const key = \`\${lastRowIndex}-\${columns[0]?.key}\`;
          const el = cellRefs.current[key];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          }
        }, 10);
      },
      scrollToBottom: () => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      },
      scrollToTop: () => {
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
      },
      getSelectedRow: () => {
        return selectedRow;
      },
      setSelectedRow: (_selectedRow: number) => {
        setStartIndex(
          Math.max(0, _selectedRow - Math.floor(visibleRowCount / 2))
        );
        setSelectedRow(_selectedRow);

        setTimeout(() => {
          const key = \`\${_selectedRow}-\${columns[0]?.key}\`;
          const el = cellRefs.current[key];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          }
        }, 10);
      },
    }));

    return (
      <>
        <div
          tabIndex={0}
          style={{
            flex: 1,
            width: "100vw",
            height: "auto",
            border: "1px solid #ebe8e8",
            overflow: "auto",
            position: "relative",
            fontFamily: "'Poppins', sans-serif",
            display: "flex",
            flexDirection: "column",
            boxShadow: " -1px 3px 5px -3px rgba(0,0,0,0.75)",
            borderRadius: "5px",
          }}
        >
          {/* Rows */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
              height: \`\${rowHeight * visibleRowCount}px\`,
              overflowY: "auto",
              position: "relative",
            }}
          >
            {/* Header */}
            <div
              className="header"
              style={{
                display: "flex",
                fontWeight: "bold",
                borderBottom: "1px solid #ebe8e8",
                background: "#f5f5f5",
                position: "sticky",
                top: 0,
                width: \`\${totalRowWidth - 25}px\`,
                zIndex: 2,
              }}
            >
              {columnHeader.map((col: any, colIdx: number) => {
                return (
                  <div
                    key={col.key}
                    className={\`col-\${colIdx} header-col \${
                      col.freeze ? "freeze" : ""
                    }\`}
                    style={{
                      width: \`\${col.width}px\`,
                      padding: "1px 4px",
                      boxSizing: "border-box",
                      borderLeft: colIdx === 0 ? "none" : "1px solid #ebe8e8",
                      fontSize: "12px",
                      position: col.freeze ? "sticky" : "relative",
                      left: col.freeze ? \`\${getFrozenLeft(colIdx)}px\` : "auto",
                      zIndex: col.freeze ? 2 : 1,
                    }}
                  >
                    {col.label}
                    <div
                      onMouseDown={(e) => {
                        onMouseDown(e, col, colIdx);
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "3px",
                        height: "100%",
                        cursor: "col-resize",
                        zIndex: 2,
                        background: "transparent",
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Body */}
            <div
              style={{
                height: \`\${data.length * rowHeight}px\`,
                position: "relative",
              }}
            >
              {data.slice(startIndex, endIndex).map((row: any, idx) => {
                const actualIndex = startIndex + idx;
                return (
                  <div
                    className={\`row \${
                      selectedRow === row.rowIndex || selectAll
                        ? "row-selected"
                        : "row-notSelected"
                    }\`}
                    key={actualIndex}
                    style={{
                      position: "absolute",
                      top: \`\${actualIndex * rowHeight}px\`,
                      display: "flex",
                      height: \`\${rowHeight}px\`,
                    }}
                    draggable
                    onDragStart={() => setDraggedRowIndex(actualIndex)}
                    onDragOver={(e) => {
                      e.preventDefault(); // Required to allow drop
                    }}
                    onDrop={() => {
                      if (
                        draggedRowIndex === null ||
                        draggedRowIndex === actualIndex
                      )
                        return;

                      const updatedData = [...data];
                      const [draggedRow] = updatedData.splice(
                        draggedRowIndex,
                        1
                      );
                      updatedData.splice(actualIndex, 0, draggedRow);

                      // Re-index after drop
                      const reindexed: any = updatedData.map(
                        (item: any, index) => ({
                          ...item,
                          rowIndex: index,
                        })
                      );

                      setData(reindexed);
                      setDraggedRowIndex(null);
                    }}
                  >
                    {columnHeader.map((col: any, colIdx: number) => {
                      const key = \`\${actualIndex}-\${col.key}\`;
                      return (
                        <Fragment key={col.key}>
                          {colIdx === 0 && col.key === "checkbox" ? (
                            <div
                              tabIndex={0}
                              ref={(el) => {
                                cellRefs.current[key] = el;
                              }}
                              onKeyDown={(e) =>
                                handleCellKeyDown(e, actualIndex, col.key, row)
                              }
                              className={\` row-data row-idx-\${
                                row.rowIndex
                              } col-\${colIdx} \${col.freeze ? "freeze" : ""}\`}
                              onContextMenu={(e) => {
                                handleContextMenu(e, row, col);
                              }}
                              style={{
                                width: \`\${col.width}px\`,
                                boxSizing: "border-box",
                                outline: "none",
                                borderLeft:
                                  colIdx === 0
                                    ? "none"
                                    : "1px solid rgb(245, 240, 240)",
                                fontSize: "12px",
                                // cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                position: col.freeze ? "sticky" : "relative",
                                left: col.freeze
                                  ? \`\${getFrozenLeft(colIdx)}px\`
                                  : "auto",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <input
                                checked={
                                  selectedRow === row.rowIndex || selectAll
                                }
                                type="checkbox"
                                readOnly={true}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  selectedRowAction(row);
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className={\`row-data col-\${colIdx} \${
                                col.freeze ? "freeze" : ""
                              }\`}
                              ref={(el) => {
                                cellRefs.current[key] = el;
                              }}
                              tabIndex={0}
                              onKeyDown={(e) =>
                                handleCellKeyDown(e, actualIndex, col.key, row)
                              }
                              onContextMenu={(e) => {
                                handleContextMenu(e, row, col);
                              }}
                              title={row[colIdx]}
                              style={{
                                width: \`\${col.width}px\`,
                                padding: "1px 4px",
                                boxSizing: "border-box",
                                outline: "none",
                                borderLeft:
                                  colIdx === 0
                                    ? "none"
                                    : "1px solid rgb(245, 240, 240)",
                                // borderBottom: "1px solid #ebe8e8",
                                fontSize: "12px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                position: col.freeze ? "sticky" : "relative",
                                left: col.freeze
                                  ? \`\${getFrozenLeft(colIdx)}px\`
                                  : "auto",
                                textAlign:
                                  col.type === "number" ? "right" : "left",
                              }}
                              onDoubleClick={() => {
                                selectedRowAction(row);
                              }}
                            >
                              {row[col.key]}
                              <div
                                onMouseDown={(e) => {
                                  onMouseDown(e, col, colIdx);
                                }}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  width: "3px",
                                  height: "100%",
                                  cursor: "col-resize",
                                  zIndex: 2,
                                  background: "transparent",
                                }}
                              />
                            </div>
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Footer */}
          <div
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              padding: "2px 10px ",
              display: "flex",
            }}
          >
            <div style={{ width: "120px" }}>
              Total Rows : {data.length.toLocaleString("en-US")}
            </div>
            <FooterComponent />
          </div>
          {visible && (
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: \`\${pos.y}px\`,
                left: \`\${pos.x}px\`,
                background: "#fff",
                border: "1px solid #ebe8e8",
                borderRadius: "6px",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
                zIndex: 1000,
                minWidth: "150px",
              }}
            >
              <RightClickComponent
                row={
                  data.filter(
                    (itm: any) => itm.rowIndex === rightClickRowIndex.rowIndex
                  )[0]
                }
              />
              <div
                className="modal-action"
                onClick={() => {
                  selectedRowAction(rightClickRowIndex);
                }}
              >
                {selectedRow === rightClickRowIndex.rowIndex
                  ? "❎ UnSelect"
                  : "✅ Select"}
              </div>
              <div
                className="modal-action"
                onClick={() => {
                  navigator.clipboard.writeText(
                    rightClickRowIndex[rightClickColumnIndex.key] || ""
                  );
                }}
              >
                📄 Copy
              </div>
              <div
                className="modal-action"
                onClick={() => {
                  delete rightClickRowIndex.rowIndex;
                  navigator.clipboard.writeText(
                    Object.values(rightClickRowIndex).join(",")
                  );
                }}
              >
                📄 Copy Row
              </div>
              <div
                className="modal-action"
                onClick={() => {
                  const confirm = window.confirm(
                    "Are you sure you want to delete all the rows?"
                  );
                  if (confirm) {
                    if (beforeDelete()) {
                      return;
                    }
                    const newData = data.filter(
                      (itm: any) => itm.rowIndex !== rightClickRowIndex.rowIndex
                    );
                    setData(newData);
                    onDelete(newData);
                  }
                }}
              >
                🗑️ Delete Row
              </div>
              <div
                className="modal-action"
                onClick={() => {
                  setSelectAll(true);
                  setTimeout(() => {
                    const confirm = window.confirm(
                      "Are you sure you want to delete this rows?"
                    );
                    if (confirm) {
                      setData([]);
                      onDelete([]);
                    }
                    setSelectAll(false);
                  }, 100);
                }}
              >
                🗑️ Delete All Row
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
);

export default DataGridViewReact\`)`;export{I as default};
