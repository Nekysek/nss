import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icons from "./icons.jsx";

function Files() {
    const [searchParams] = useSearchParams();
    let [dir, setDir] = useState(null);
    const [count, setCount] = useState(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState(null);

    useEffect(() => {
        const fetchDirData = async () => {
            const diroute = searchParams.get("dir");

            if (diroute === null) {
                window.location.href = "./?dir=files/";
                return;
            }

            try {
                const data = { dir: diroute };
                let response = await fetch("/library/files.php", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                response = await response.json();

                if(response["status"] == "redirect"){
                    location.href = response["href"];
                    return;
                } else if(response["status"] == "success"){
                    const contentdata = JSON.parse(response["files"]);
                    const countdata = JSON.parse(response["count"]);

                    setDir(diroute);
                    setCount(countdata);
                    setContent(contentdata);
                } else {
                    console.log("Unexpected status");
                    return;
                }
                
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDirData();
    }, [searchParams]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (dir == "files/") dir = "Kořenová složka";

    let oneup = "";
    if(location.href !== "/?dir=files/"){
        oneup = <a className="text-white hover:opacity-50" href={location.href + "../"}>↑ Pokračovat o složku výše</a>;
    } else {
        oneup = <a className="text-white cursor-not-allowed opacity-75">↑ Nelze jít o složku výše</a>;
    }

    return (
        <div id="filesbox" className="sm:container mx-auto text-center border rounded-md bg-box py-8 px-8 flex flex-col justify-center items-center">
            <h1 className="text-white text-3xl mb-4">Nekysek Sort System</h1>
            <div className="flex justify-center flex-col mb-4">
                <span className="text-white">Cesta:</span>
                <span className="text-white">{dir}</span>
            </div>
            <span className="text-white">Složek: {count["folders"]} | Souborů: {count["files"]}</span>
            {oneup}
            <div id="filescontainer" className='mt-6 flex flex-row justify-start items-start flex-wrap'>
                {
                    content.map((item, index) => (
                        <a
                            title="Otevřít"
                            className={`w-min cursor-pointer w-full flex flex-col justify-center items-center p-2 ${index !== content.length - 1 ? 'mr-4' : ''}`}
                            key={index}
                            type={item["type"]}
                            data-location={item["location"]}
                        >
                            <img className="min-w-[48px] max-w-[48px] min-h-[48px] max-h-[48px]" src={Icons(item["type"])} alt="Ikona souboru" />
                            <span className="text-white">{item["name"]}</span>
                        </a>
                    ))
                }
            </div>
        </div>
    );
}

export default Files;