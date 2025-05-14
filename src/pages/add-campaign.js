import React from 'react';
import CampaignForm from '../components/CampaignForm'; 
import Navbar from '../components/Navbar'; 

const AddCampaignPage = () => {
    return (
        <>
            <Navbar /> 
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <CampaignForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddCampaignPage;
