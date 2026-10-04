import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Login({ isOpen, onClose, onLoginSuccess }) {
  const boxRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  async function FormSubmit(event) {
    event.preventDefault();
    let user = document.getElementById("input-user").value || "";
    let pass = document.getElementById("input-pass").value || "";
    let type = document.getElementById("submit");

    if(type === null){
      return;
    }

    if (user === "" || pass === "") {
        return;
    }

    type = type.innerHTML;
    while (type.replace(" ", "").length < type.length) {
      type = type.replace(" ", "");
    }

    if(type == "Přihlásitse"){

      try {
          const data = {
              user: user,
              pass: pass
          }
          let response = await fetch("/login/login.php", {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(data)
          });
          response = await response.json();

          if (document.getElementById("info") !== null) {
              document.getElementById("info").remove();
          }

          let info = document.createElement("span");
          info.id = "info";
          info.classList.add("flex", "justify-center", "items-center", "mt-5");

          if (response["status"] === "success") {
              info.classList.add("text-green-500");
              info.innerHTML = "Úspěšně přihlášen.";
              setTimeout(() => {
                  onLoginSuccess();
                  onClose();
                  if(location.pathname == "/editor"){
                    window.location.reload();
                  }
              }, 2000);
          } else if(response["status"] === "error"){
            if(response["error"] === "wrong user or pass"){
              info.classList.add("text-red-500");
              info.innerHTML = "Nesprávné jméno nebo heslo.";
            } else {
              info.classList.add("text-red-500");
              info.innerHTML = "Chyba při přihlášení.";
            }
          } else {
              info.classList.add("text-red-500");
              info.innerHTML = "Chyba při přihlášení.";
          }

          document.getElementById("login-form").append(info);
      } catch (error) {
          console.log(error);
      }

    } else if(type == "Registrovatse"){

      try {
        const data = {
            user: user,
            pass: pass
        }
        let response = await fetch("/login/register.php", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        response = await response.json();

        if (document.getElementById("info") !== null) {
            document.getElementById("info").remove();
        }

        let info = document.createElement("span");
        info.id = "info";
        info.classList.add("flex", "justify-center", "items-center", "mt-5");

        if (response["status"] === "success") {
            info.classList.add("text-green-500");
            info.innerHTML = "Úspěšně registrován.";
            setTimeout(() => {
                onLoginSuccess();
                onClose();
                if(location.pathname == "/editor"){
                  window.location.reload();
                }
            }, 2000);
        } else if(response["status"] === "error"){
          if(response["error"] === "user too long or too short"){

            info.classList.add("text-red-500");
            info.innerHTML = "Uživatelské jménu musí být v rozmezí 3-30 znaků.";

          } else if(response["error"] === "pass too long or too short"){

            info.classList.add("text-red-500");
            info.innerHTML = "Heslo musí být v rozmezí 8-30 znaků.";

          } else if(response["error"] === "user already exists"){

            info.classList.add("text-red-500");
            info.innerHTML = "Tento uživatel již existuje.";

          } else {

            info.classList.add("text-red-500");
            info.innerHTML = "Chyba při přihlášení.";

          }
        } else {
          
            info.classList.add("text-red-500");
            info.innerHTML = "Chyba při přihlášení.";

        }

        document.getElementById("login-form").append(info);
      } catch (error) {
          console.log(error);
      }

    }
  }

  function Change() {
    let login = document.getElementById("login");
    let register = document.getElementById("register");
    let form = document.getElementById("login-form");

    let user = document.getElementById("input-user").value || "";
    let pass = document.getElementById("input-pass").value || "";

    if (login.classList.contains("cursor-pointer")) {
        register.classList.toggle("cursor-pointer");
        register.classList.toggle("bg-purple-600");
        register.classList.toggle("hover:bg-purple-700");
        login.classList.toggle("cursor-pointer");
        login.classList.toggle("bg-purple-600");
        login.classList.toggle("hover:bg-purple-700");

        form.innerHTML = "\
            <label class=\"block mb-5\">\
                <span class=\"block text-white\">Uživatelské jméno:</span>\
                <input\
                type=\"text\"\
                name=\"user\"\
                class=\"mt-1 block w-full border rounded-lg bg-box p-2 text-white\"\
                id=\"input-user\"\
                value=\"" + user + "\"\
                />\
            </label>\
            <label class=\"block mb-10\">\
                <span class=\"block text-white\">Heslo:</span>\
                <input\
                type=\"password\"\
                name=\"pass\"\
                class=\"mt-1 block w-full border rounded-lg bg-box p-2 text-white\"\
                id=\"input-pass\"\
                value=\"" + pass + "\"\
                />\
            </label>\
            <button\
                id=\"submit\"\
                type=\"submit\"\
                class=\"w-full text-white p-2 rounded-lg bg-purple-600 hover:bg-purple-700\"\
            >\
                Přihlásit se\
            </button>\
        ";
    } else if (register.classList.contains("cursor-pointer")) {
        register.classList.toggle("cursor-pointer");
        register.classList.toggle("bg-purple-600");
        register.classList.toggle("hover:bg-purple-700");
        login.classList.toggle("cursor-pointer");
        login.classList.toggle("bg-purple-600");
        login.classList.toggle("hover:bg-purple-700");

        form.innerHTML = "\
            <label class=\"block mb-5\">\
                <span class=\"block text-white\">Uživatelské jméno:</span>\
                <input\
                type=\"text\"\
                name=\"user\"\
                class=\"mt-1 block w-full border rounded-lg bg-box p-2 text-white\"\
                id=\"input-user\"\
                value=\"" + user + "\"\
                />\
            </label>\
            <label class=\"block mb-10\">\
                <span class=\"block text-white\">Heslo:</span>\
                <input\
                type=\"password\"\
                name=\"pass\"\
                class=\"mt-1 block w-full border rounded-lg bg-box p-2 text-white\"\
                id=\"input-pass\"\
                value=\"" + pass + "\"\
                />\
            </label>\
            <button\
                id=\"submit\"\
                type=\"submit\"\
                class=\"w-full text-white p-2 rounded-lg bg-purple-600 hover:bg-purple-700\"\
            >\
                Registrovat se\
            </button>\
          ";
    }
  }

  return (
    <div className="fixed inset-0 bg-background bg-opacity-75 flex justify-center items-center z-50">
      <div
        ref={boxRef}
        className="bg-box p-6 rounded-lg shadow-lg relative w-96"
      >
        <button
          className="absolute top-3 right-3 text-white hover:text-purple-600"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex justify-around items-center mb-8">
            <a id="login" onClick={Change} className="text-white text-xl font-semibold border rounded p-2 bg-purple-600">Přihlášení</a>
            <a id="register" onClick={Change} className="text-white text-xl font-semibold border rounded p-2 cursor-pointer hover:bg-purple-700">Registrace</a>
        </div>
        <form id="login-form" onSubmit={FormSubmit}>
          <label className="block mb-5">
            <span className="block text-white">Uživatelské jméno:</span>
            <input
              type="text"
              name="user"
              className="mt-1 block w-full border rounded-lg bg-box p-2 text-white"
              id="input-user"
            />
          </label>
          <label className="block mb-10">
            <span className="block text-white">Heslo:</span>
            <input
              type="password"
              name="pass"
              className="mt-1 block w-full border rounded-lg bg-box p-2 text-white"
              id="input-pass"
            />
          </label>
          <button
            id="submit"
            type="submit"
            className="w-full text-white p-2 rounded-lg bg-purple-600 hover:bg-purple-700"
          >
            Přihlásit se
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
