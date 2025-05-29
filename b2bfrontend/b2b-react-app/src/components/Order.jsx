import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { t } from '../utils/translator';
import { useLocation, useNavigate } from 'react-router-dom';
import './Order.css'; // Create this file for styles

const Order = () => {
    const [id, setId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.results?.id) {
            setId(location.state.results.id);
        }
    }, [location.state]);

    const renderOrderPageMessage = () => {
        const rawHtml = t('ORDER_PAGE').replace('{id}', id || '');
        return { __html: rawHtml };
    };

    return (
        <Container className="order-page">
  

            {id && <div className="order-message" dangerouslySetInnerHTML={renderOrderPageMessage()} />}
        </Container>
    );
};

export default Order;
