import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { t } from '../utils/translator';
import { useLocation, useNavigate } from 'react-router-dom';

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
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                {id && (
                    <Typography
                        variant="body1"
                        dangerouslySetInnerHTML={renderOrderPageMessage()}
                        sx={{ lineHeight: 1.6 }}
                    />
                )}
            </Paper>
        </Container>
    );
};

export default Order;
