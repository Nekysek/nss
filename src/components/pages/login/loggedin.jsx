const LoggedIn = async (setLogged) => {
        try {
            const response = await fetch('/login/loggedin.php', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            let data = await response.json();
            if (data["loggedin"] !== undefined) {
                if (data["loggedin"]) {
                    setLogged(true);
                } else {
                    setLogged(false);
                }
            }
        } catch (error) {
            console.log(error);
        }
}

export default LoggedIn