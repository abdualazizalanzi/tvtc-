import React from 'react';

interface CertificateViewProps {
  certificate: {
    title: string;
    issuedAt: string;
    verificationCode: string;
    imageUrl?: string;
    description?: string;
  };
}

const CertificateView: React.FC<CertificateViewProps> = ({ certificate }) => {
  return (
    <div className="certificate-view">
      <h2>{certificate.title}</h2>
      <p>Issued At: {certificate.issuedAt}</p>
      <p>Verification Code: {certificate.verificationCode}</p>
      {certificate.imageUrl && (
        <img src={certificate.imageUrl} alt={certificate.title} className="certificate-image" />
      )}
      {certificate.description && <p>{certificate.description}</p>}
    </div>
  );
};

export default CertificateView;