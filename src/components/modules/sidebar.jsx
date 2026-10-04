import { useEffect, useState } from "react";
import gsap from 'gsap';
import Login from "../pages/login/login.jsx";
import Notification from './notification.jsx';
import { useLocation } from 'react-router-dom';

function SideBar() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [NotificationVisible, setNotificationVisible] = useState(false);
    const location = useLocation();

    const openLogin = () => setIsLoginOpen(true);
    const closeLogin = () => setIsLoginOpen(false);

    const Logout = async (setNotificationVisible, LoggedIn, Expand) => {
        try {
            const response = await fetch('/login/logout.php', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            let data = await response.json();
            
            if (data["status"] === "success") {
                setNotificationVisible(true);
                LoggedIn();
                Expand();
                if(location.pathname == "/editor"){
                    window.location.reload();
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const LoggedIn = async () => {
        try {
            const response = await fetch('/login/loggedin.php', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            let data = await response.json();
            let status = "Neznámý stav.";
            if (data["loggedin"] !== undefined) {
                if (data["loggedin"]) {
                    status = data["user"];
                } else {
                    status = "notloggedin";
                }
            }
            setTitle(status || "Došlo k chybě.");
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        LoggedIn();
    }, []);

    function Expand() {
        const sidebar = document.getElementById('sidebar');
        const expandBtn = document.getElementById('expandc');
        const accinfo = document.getElementById('accinfo');

        if (expanded) {
            document.querySelectorAll('.desc').forEach((desc) => {
                gsap.to(desc, {
                    duration: 0.5,
                    x: '100%',
                    opacity: 0,
                    ease: 'power2.out',
                    onComplete: () => desc.classList.add("hidden")
                });
            });
            gsap.timeline()
                .to(accinfo, {
                    duration: 0.5,
                    x: '100%',
                    opacity: 0,
                    ease: 'power2.out',
                    onComplete: () => accinfo.classList.add('hidden')
                })
                .to(sidebar, {
                    duration: 1,
                    width: 'max-content',
                    ease: 'power2.out',
                }, "<")
                .to(expandBtn, {
                    duration: 1,
                    marginLeft: "0px",
                    ease: 'power2.out',
                }, "<");
            setExpanded(false);
            expandBtn.innerHTML = "▶";
        } else {
            accinfo.classList.remove('hidden');
            document.querySelectorAll('.desc').forEach((desc) => {
                desc.classList.remove("hidden");
            });
            gsap.timeline()
                .to(sidebar, {
                    duration: 1,
                    width: '250px',
                    ease: 'power2.out',
                }, "<")
                .to(expandBtn, {
                    duration: 1,
                    marginLeft: "195px",
                    ease: 'power2.out',
                }, "<")
                .fromTo(accinfo,
                    { x: '100%', opacity: 0 },
                    { duration: 0.5, x: '0%', opacity: 1, ease: 'power2.out' }
                );
                document.querySelectorAll('.desc').forEach((desc) => {
                    gsap.fromTo(desc,
                        { x: '100%', opacity: 0 },
                        { duration: 0.5, x: '0%', opacity: 1, ease: 'power2.out' }
                    );
                }, "<");

            setExpanded(true);
            expandBtn.innerHTML = "◀";
        }
    }

    return (
        <>
            <div id="sidebar" className="md:flex flex-col justify-between hidden text-white h-screen bg-sidebar-bg shadow-lg shadow-indigo-500/50 w-max p-2 relative">
                <div className="text-center">
                    <h2 className="text-2xl pb-2">NSS</h2>
                    <hr className="mb-3 mt-2"></hr>
                    <a className="text-base pt-2 cursor-pointer flex justify-center items-center" href="./">
                        <svg className="bg-white rounded-full p-1 flex justify-center items-center" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" width="24" height="24" color="#000000" fill="none">
                            <path d="M8.9995 22L8.74887 18.4911C8.61412 16.6046 10.1082 15 11.9995 15C13.8908 15 15.3849 16.6046 15.2501 18.4911L14.9995 22" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M2.35157 13.2135C1.99855 10.9162 1.82204 9.76763 2.25635 8.74938C2.69065 7.73112 3.65421 7.03443 5.58132 5.64106L7.02117 4.6C9.41847 2.86667 10.6171 2 12.0002 2C13.3832 2 14.5819 2.86667 16.9792 4.6L18.419 5.64106C20.3462 7.03443 21.3097 7.73112 21.744 8.74938C22.1783 9.76763 22.0018 10.9162 21.6488 13.2135L21.3478 15.1724C20.8473 18.4289 20.5971 20.0572 19.4292 21.0286C18.2613 22 16.5538 22 13.139 22H10.8614C7.44652 22 5.73909 22 4.57118 21.0286C3.40327 20.0572 3.15305 18.4289 2.65261 15.1724L2.35157 13.2135Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        <span className="desc ms-2 hidden">Domů</span>
                    </a>
                </div>
                <div>
                    <div className="flex justify-center items-center mb-6 p-2" id="userdata">
                        <svg className="bg-white rounded-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M7.5 17C9.8317 14.5578 14.1432 14.4428 16.5 17M14.4951 9.5C14.4951 10.8807 13.3742 12 11.9915 12C10.6089 12 9.48797 10.8807 9.48797 9.5C9.48797 8.11929 10.6089 7 11.9915 7C13.3742 7 14.4951 8.11929 14.4951 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {title === "notloggedin" ? (
                            <a id="accinfo" className="hidden ms-2 cursor-pointer hover:underline hover:decoration-white" title="Přihlásit se" onClick={openLogin}>Přihlásit se</a>
                        ) : (
                            <span id="accinfo" className="hidden ms-2">
                                {title} <a className="ms-2 cursor-pointer" onClick={() => Logout(setNotificationVisible, LoggedIn, Expand)}>🔐</a>
                            </span>
                        )}
                    </div>
                    <span id="expand" className="flex justify-center items-center">
                        <a id="expandc" onClick={Expand} className="text-center border cursor-pointer bg-expand rounded">▶</a>
                    </span>
                </div>
            </div>
            <Notification 
                message="Úspěšně odhlášeno" 
                isVisible={NotificationVisible} 
                onClose={() => setNotificationVisible(false)} 
            />
            <Login 
                isOpen={isLoginOpen} 
                onClose={closeLogin} 
                onLoginSuccess={() => { 
                    LoggedIn();
                    Expand();
                }} 
            />
        </>
    );
}

export default SideBar;
