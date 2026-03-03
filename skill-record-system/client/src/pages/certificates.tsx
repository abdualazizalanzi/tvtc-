import React, { useEffect, useState } from 'react';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch('/api/certificates');
        const data = await response.json();
        setCertificates(data);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <div className="certificates-container">
      <h1>My Certificates</h1>
      <ul>
        {certificates.map((certificate) => (
          <li key={certificate.id} className="certificate-item">
            <h2>{certificate.titleAr || certificate.titleEn}</h2>
            <p>Issued At: {new Date(certificate.issuedAt).toLocaleDateString()}</p>
            <p>Certificate Number: {certificate.certificateNumber}</p>
            <a href={certificate.verificationCode} target="_blank" rel="noopener noreferrer">Verify Certificate</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Certificates;