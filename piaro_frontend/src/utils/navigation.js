import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
    const navigate = useNavigate();

    const goToPublication = (slug) => {
        navigate(`/publication/${slug}`);
    };

    const goToCommunity = (slug) => {
        navigate(`/community/${slug}`);
    };

    const goToUser = (id) => {
        navigate(`/user/${id}`);
    };

    const goToHome = () => {
        navigate('/');
    };

    const goToProfile = () => {
        navigate('/profile');
    };

    const goToCreatePublication = () => {
        navigate('/create-publication');
    };

    const goToSearch = (query = '', hashtags = '') => {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (hashtags) params.set('hashtags', hashtags);
        navigate(`/search?${params.toString()}`);
    };

    return {
        goToPublication,
        goToCommunity,
        goToUser,
        goToHome,
        goToProfile,
        goToCreatePublication,
        goToSearch,
    };
};