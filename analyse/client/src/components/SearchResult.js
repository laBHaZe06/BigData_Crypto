import React, {useState,useEffect} from 'react';

const SearchResult = ({props}) => {
    const [loading, setLoading] = useState(true);
    
    //loading 300ms before showing results
    useEffect(() => {
       (props) && (props.name) && setTimeout(() => {
            setLoading(false);
            }, 300);
            }, [props]);

    return loading ? (
    <div>Loading...</div>
    ) : (
        <>
            <h5 className='text-white'>{props.name} - {props.symbol}</h5> 
        </>
    );
};

export default SearchResult;

