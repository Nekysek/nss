function ContextMenu() {
    // double click open file/folder
        document.addEventListener("dblclick", (e) => {
            e.preventDefault();
            if(e.target === null){
                return;
            }
            let target = e.target;
            
            if(target.parentElement === null){
                return;
            }
            target = target.parentElement;

            if(target.tagName === "A"){
                if(target.getAttribute("data-location") === null){
                    return;
                }
                let loc = target.getAttribute("data-location");
                // odkaz musí být relativní cesta v rámci aplikace a vložený text se escapuje (ochrana proti XSS přes názvy souborů)
                if(!/^(\.\/|\/)/.test(loc) || /^\/\//.test(loc)){
                    return;
                }
                loc = encodeURI(loc).replace(/'/g, "%27");

                location.href = loc;
            }
        });

    // if shown contextmenu hide it
        document.addEventListener("click", (e) => {
            // Zkontroluj, jestli contextmenu existuje
            if (document.getElementById("contextmenu") === undefined) {
                return;
            }
            let contextmenu = document.getElementById("contextmenu");
        
            // Pokud kliknutí proběhne přímo na contextmenu, zastav propagaci události
            if (contextmenu.contains(e.target)) {
                e.stopPropagation(); // Zabraňuje události klikat na nadřazené elementy
                return;
            }
        
            // Schovej contextmenu, pokud není skryté
            if (!contextmenu.classList.contains("hidden")) {
                contextmenu.classList.add("hidden");
            }
        });

    // right click context menu
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            if(e.target === null){
                return;
            }
            let target = e.target;
            
            if(target.parentElement === null){
                return;
            }
            target = target.parentElement;

            if(document.getElementById("contextmenu") === undefined){
                return;
            }
            let contextmenu = document.getElementById("contextmenu");

            contextmenu.style.top = e.clientY + "px";
            contextmenu.style.left = e.clientX + "px";

            if(target.tagName === "BODY"){
                contextmenu.innerHTML = "\
                    <a class=\"text-white\" href=\"javascript: location.reload();\" title=\"reload\">načíst znovu</a>\
                ";
                contextmenu.classList.remove("hidden");
            } else if(target.tagName === "A"){
                if(target.getAttribute("type") === null){
                    return;
                }
                let type = target.getAttribute("type");

                if(target.getAttribute("data-location") === null){
                    return;
                }
                let loc = target.getAttribute("data-location");
                // odkaz musí být relativní cesta v rámci aplikace a vložený text se escapuje (ochrana proti XSS přes názvy souborů)
                if(!/^(\.\/|\/)/.test(loc) || /^\/\//.test(loc)){
                    return;
                }
                loc = encodeURI(loc).replace(/'/g, "%27");

                // only downloadble like zip
                    let onlydownload = ["zip","ovpn"];

                if(type == "dir"){
                    contextmenu.innerHTML = "\
                        <a class=\"text-white\" style=\"margin: 10px;\" href=\"" + loc + "\" title=\"open\">Otevřít</a>\
                    ";
                } else if(onlydownload.includes(type)){
                    contextmenu.innerHTML = "\
                        <a class=\"text-white\" style=\"margin: 10px;\" href=\"" + loc + "\" title=\"download\">Stáhnout</a>\
                    ";
                } else {
                    contextmenu.innerHTML = "\
                        <a class=\"text-white\" style=\"margin: 10px;\" href=\"" + loc + "\" title=\"open\">Otevřít</a>\
                        <hr>\
                        <a class=\"text-white\" style=\"margin: 10px;\" href=\"/editor?file=" + encodeURIComponent(target.getAttribute("data-location")) + "\" title=\"edit\">Upravit</a>\
                    ";
                }

                contextmenu.classList.remove("hidden");
            } else {
                console.log(target.tagName);
            }
        });

    return (
        <div id="contextmenu" className="hidden bg-contextmenu p-2 rounded fixed"><span className="text-white">Došlo k chybě</span></div>
    );
}

export default ContextMenu;