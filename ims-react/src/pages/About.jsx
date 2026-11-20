export default function About() {
  return (
    <main>
      <section aria-labelledby="about-heading">
        <h2 id="about-heading">About This Project</h2>
        <p>The Inventory Management System (IMS) is a course project that models how a
          small organization can move from paper stock sheets and spreadsheets to a
          single, shared system. This version is a front-end prototype: it uses dummy
          data and browser storage to demonstrate the employee and manager experience
          ahead of connecting a real back end.</p>
      </section>
      <section aria-labelledby="mission-heading">
        <h2 id="mission-heading">Our Mission</h2>
        <p>To give organizations a simple, trustworthy way to track what they own,
          where it goes, and when it needs to be replenished — reducing losses,
          stock-outs, and over-ordering.</p>
      </section>
      <section aria-labelledby="vision-heading">
        <h2 id="vision-heading">Our Vision</h2>
        <p>To make accurate inventory control accessible to every organization,
          regardless of size, so that decisions about purchasing and supply are based
          on facts instead of guesswork.</p>
      </section>
    </main>
  );
}
