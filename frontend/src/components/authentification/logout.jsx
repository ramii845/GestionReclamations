import {useEffect} from 'react';
import { useNavigate} from 'react-router-dom'

const Logout = () => {
    const navigate = useNavigate();
useEffect(() => {
localStorage.removeItem("CC_Token");

navigate("/login");
}, [navigate]);
return (
<div>
    
</div>
)
};
export default Logout;