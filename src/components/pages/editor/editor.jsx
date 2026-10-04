import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Editor = () => {
    const [searchParams] = useSearchParams();
    const [Logged, setLogged] = useState(null);
    const [Response, setResponse] = useState(null);
    const [Close, setClose] = useState(null);
    const [lineNumbers, setLineNumbers] = useState('1');

    const codeEditorRef = useRef(null);
    const lineNumbersRef = useRef(null);

    const updateLineNumbers = () => {
        const codeEditor = codeEditorRef.current;
        if (codeEditor) {
            const lines = codeEditor.value.split('\n').length;
            const numbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
            setLineNumbers(numbers);
        }
    };    

    const syncScroll = () => {
        if (lineNumbersRef.current && codeEditorRef.current) {
            lineNumbersRef.current.scrollTop = codeEditorRef.current.scrollTop;
        }
    };

    const Rename = () => {
        console.log("runned");
        const editordiv = document.getElementById("editordiv");

        let rename = document.createElement("div");
        rename.id = "editor_rename_div";
        const renameWindow = document.createElement("div");
        renameWindow.id = "editor_rename_window";
        renameWindow.style.cssText = "text-align: center; position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); background-color: rgb(17 24 39); color: #ffffff; padding: 40px; border-radius: 5px;";
        const renameLabel = document.createElement("label");
        renameLabel.htmlFor = "renamed_file";
        renameLabel.textContent = "Nový název: ";
        const renameInput = document.createElement("input");
        renameInput.type = "text";
        renameInput.id = "renamed_file";
        renameInput.name = "renamed_file";
        renameInput.placeholder = searchParams.get("file").split("/").pop();
        renameInput.onkeydown = (e) => {
            if(e.key === "Enter" && renameInput.value.trim() !== ""){
                RenameFile(renameInput.value.trim());
            }
        };
        renameWindow.append(renameLabel, renameInput);
        rename.append(renameWindow);
        rename.style.position = "fixed";
        rename.style.left = "0";
        rename.style.top = "0";
        rename.style.width = "100vw";
        rename.style.height = "100vh";
        rename.style.backgroundColor = "rgba(30,30,30,0.7)";
        rename.onclick = (e) => {
            if(e.target == null){
                return;
            }

            if(e.target.id == "editor_rename_div"){
                if(document.getElementById("editor_rename_div") !== undefined){
                    document.getElementById("editor_rename_div").remove();
                }
            }
        };

        editordiv.append(rename);
    }

    const RenameFile = async(renamed) => {
        try {
            const send = {content: renamed,dir: searchParams.get("file")}
            let response = await fetch('/library/rename.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(send),
            });

            response = await response.json();
            if(response["status"] === "success"){
                window.location.href = "/editor?file=" + encodeURIComponent(response["file"]);
            } else {
                console.log(response["error"]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const SaveFile = async() => {
        const editordiv = document.getElementById("editordiv");

        let save = document.createElement("div");
        save.id = "editor_save_div";
        save.innerHTML = "\
            <div id=\"editor_save_window\" style=\"text-align: center; position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); background-color: rgb(17 24 39); color: #ffffff; padding: 40px; border-radius: 5px;\">\
                <span>Probíhá ukládání</span>\
            </div>\
        ";
        save.style.position = "fixed";
        save.style.left = "0";
        save.style.top = "0";
        save.style.width = "100vw";
        save.style.height = "100vh";
        save.style.backgroundColor = "rgba(30,30,30,0.7)";
        save.onclick = (e) => {
            if(e.target == null){
                return;
            }

            if(e.target.id == "editor_save_div"){
                if(document.getElementById("editor_save_div") !== undefined){
                    document.getElementById("editor_save_div").remove();
                }
            }
        };

        editordiv.append(save);

        if(document.getElementById("codeeditor") === undefined){
            console.log("Došlo k chybě element s kodem nenalezen.");
            return;
        }

        try {
            const send = {content: document.getElementById("codeeditor").defaultValue.toString(),dir: searchParams.get("file")}
            let response = await fetch('/library/save.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(send),
            });
            response = await response.json();
            
            let save_window = document.getElementById("editor_save_window");

            if(response["status"] == "success"){
                save_window.innerHTML = "Soubor uložen.";
                save_window.style.color = "green";
                setTimeout(() => {
                    if(document.getElementById("editor_save_div") !== null){
                        document.getElementById("editor_save_div").remove();
                    }
                }, 2000);
            }
            save_window.innerHTML = "Soubor uložen.";
        } catch (error) {
            console.log(error);
        }
    }

    const CloseEditor = async() => {
        if(document.getElementById("codeeditor") === undefined){
            console.log("Došlo k chybě element s kodem nenalezen.");
            return;
        }
        let code = document.getElementById("codeeditor").defaultValue.toString();

        if(code == Response["content"]){
            const editordiv = document.getElementById("editordiv");

            let confirmation = document.createElement("div");
            confirmation.id = "editor_close_confirmation_div";
            confirmation.innerHTML = "\
                <div style=\"text-align: center; position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); background-color: rgb(17 24 39); color: #ffffff; padding: 40px; border-radius: 5px;\">\
                    <h2 style=\"font-size: 20px;\">Chcete pokračovat?</h2>\
                    <span>Neuložené změny budou ztraceny.</span>\
                    <div class=\"w-full flex justify-around items-center pt-8\">\
                        <a class=\"editor_close_confirmation_option\" id=\"editor_close_confirmation_back\" style=\"padding: 10px; background-color: rgba(0, 23, 99, 0.4); border-radius: 5px;\">Vrátit se</a>\
                        <a class=\"editor_close_confirmation_option\" id=\"editor_close_confirmation_close\" style=\"padding: 10px; background-color: rgba(0, 23, 99, 0.4); border-radius: 5px;\">Zavřít</a>\
                    </div>\
                </div>\
            ";
            confirmation.style.position = "fixed";
            confirmation.style.left = "0";
            confirmation.style.top = "0";
            confirmation.style.width = "100vw";
            confirmation.style.height = "100vh";
            confirmation.style.backgroundColor = "rgba(30,30,30,0.7)";
            confirmation.onclick = (e) => {
                if(e.target == null){
                    return;
                }

                if(e.target.id == "editor_close_confirmation_div"){
                    if(document.getElementById("editor_close_confirmation_div") !== undefined){
                        document.getElementById("editor_close_confirmation_div").remove();
                    }
                }
            };

            editordiv.append(confirmation);

            // func
                document.getElementById("editor_close_confirmation_back").onclick = () => {
                    if(document.getElementById('editor_close_confirmation_div') !== undefined){
                        document.getElementById('editor_close_confirmation_div').remove();
                    };
                };

                document.getElementById("editor_close_confirmation_close").onclick = () => {
                    window.location.href = Close;
                }
        }
    }

    useEffect(() => {
        const dir = searchParams.get("file");
        if (dir) {
            let link = "/?dir=" + dir.replace(dir.split("/")[dir.split("/").length - 1], "");
            setClose(link);
        } else {
            setClose("/");
        }
    }, [searchParams]);

    const LoggedIn = async () => {
        try {
            const response = await fetch('/login/loggedin.php', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            let data = await response.json();
            setLogged(data["loggedin"] !== undefined ? data["loggedin"] : false);
        } catch (error) {
            console.log(error);
            setLogged(false);
        }
    };

    useEffect(() => {
        LoggedIn();
    }, []);

    useEffect(() => {
        const fetchDirData = async () => {
            const file = searchParams.get("file");

            if (file === null) {
                window.location.href = "./";
                return;
            }

            try {
                const data = { file: file };
                let response = await fetch("/library/editor.php", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                response = await response.json();

                setResponse(response);
                updateLineNumbers();
            } catch (error) {
                console.log(error);
            }
        };

        fetchDirData();
    }, [Logged, searchParams]);

    if (!Logged) {
        return (
            <div className="sm:container mx-auto text-center border rounded-md bg-box p-8 flex flex-col justify-center items-center">
                <span className="text-white">Pro editaci souborů se musíš přihlásit.</span>
            </div>
        );
    }

    if (Response && Response["status"] === "success") {
        return (
            <div id="editordiv" className="w-full h-full mx-auto rounded-md bg-box flex flex-col bg-gray-900">
                <div className="w-full p-4 flex flex-row justify-between items-center bg-gray-800 border-2 border-gray-700">
                    <div className="flex flex-row justify-center items-center">
                        <img className="pr-4 w-[40px]" src="/favicon.ico" alt="Ikona" />
                        <ul className="dropdown">
                            <li className="text-white">Soubor
                                <ul className="flex flex-col justify-center items-center rounded-[5px]">
                                    <li className="w-full flex"><a className="w-full flex justify-center items-center hover:bg-white hover:text-black rounded-[5px] cursor-pointer px-2 py-1 ">Nový soubor</a></li>
                                    <li className="w-full flex"><a onClick={Rename} className="w-full flex justify-center items-center hover:bg-white hover:text-black rounded-[5px] cursor-pointer px-2 py-1 ">Přejmenovat</a></li>
                                    <li className="w-full flex"><a onClick={SaveFile} className="w-full flex justify-center items-center hover:bg-white hover:text-black rounded-[5px] cursor-pointer px-2 py-1 ">Uložit</a></li>
                                    <hr className="w-full my-2"></hr>
                                    <li className="w-full flex"><a onClick={CloseEditor} className="w-full flex justify-center items-center hover:bg-white hover:text-black rounded-[5px] cursor-pointer px-2 py-1 ">Zavřít</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <h2 className="text-white">{searchParams.get("file").split("/")[searchParams.get("file").split("/").length - 1]} - Editor</h2>
                    <a className="text-white cursor-pointer" onClick={CloseEditor}>✕</a>
                </div>
                <div className="flex-grow flex w-full h-full overflow-hidden">
                    <div
                        ref={lineNumbersRef}
                        className="line-numbers bg-gray-800 text-gray-400 text-right px-2 py-4 select-none overflow-hidden"
                        style={{ width: '40px' }}
                    >
                        <pre>{lineNumbers}</pre>
                    </div>
                    <textarea
                        ref={codeEditorRef}
                        onInput={updateLineNumbers}
                        onScroll={syncScroll}
                        className="w-full h-full bg-gray-900 text-white border-none p-4 font-mono resize-none focus:outline-none whitespace-pre overflow-y-scroll editorscrollbar"
                        name="codeeditor"
                        id="codeeditor"
                        defaultValue={Response["content"]}
                        wrap="off"
                        spellCheck="false"
                    />
                </div>
            </div>
        );
    } else if (Response["status"] === "redirect") {
        window.location.href = Response["redirect"];
    } else {
        console.log(Response);
    }
}

export default Editor;
