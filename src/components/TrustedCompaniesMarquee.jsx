const trustedDomains = [
  "skinclin.in",
  "digitalfrontierfoundation.com",
  "dryashpandey.com",
  "mrityunjaysingh.com",
  "banarasididi.com",
  "ilovepdfeditor.com",
  "dropoutdigital.com",
  "vgmsecurity.com",
  "breachradar.com",
  "dorkradar.com",
  "360flashdrive.com",
  "sashospital.com",
  "cybersena.in",
  "priyahospital.com",
];

const marqueeDomains = [...trustedDomains, ...trustedDomains];

function TrustedCompaniesMarquee() {
  return (
    <section className="trusted" aria-label="Trusted by companies">
      <p>Trusted by companies securing production domains</p>
      <div className="trusted-marquee">
        <div className="trusted-marquee-track">
          {marqueeDomains.map((domain, index) => (
            <span
              className="trusted-domain-badge"
              key={`${domain}-${index}`}
              aria-hidden={index >= trustedDomains.length}
            >
              {domain}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustedCompaniesMarquee;
