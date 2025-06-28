import {useEffect} from 'react';
import { useNavigate} from 'react-router-dom'
import {logout} from '../../services/authService'
const Logout = () => {
    const navigate = useNavigate();
useEffect(() => {
localStorage.removeItem("CC_Token");
localStorage.removeItem("user")
logout()
navigate("/login");
}, [navigate]);
return (
<div>
    
</div>
)
};
export default Logout;