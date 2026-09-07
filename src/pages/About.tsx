import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "../components/common/UI";
export default function About() {
  return (
    <div className="container section-bottom">
      <Breadcrumb items={[{ label: "Our story" }]} />
      <section className="about-intro">
        <p className="eyebrow">HELLO, WE’RE JOYNEEDS</p>
        <h1>
          Everyday needs.
          <br />
          Thoughtfully considered.
        </h1>
        <p>
          Useful things have a way of making a day feel easier. JoyNeeds is
          being built around that simple idea: help you discover practical
          products without making shopping complicated.
        </p>
      </section>
      <div className="about-columns">
        <div>
          <h2>Made for real life.</h2>
          <p>
            From a more organized kitchen to a tidier workspace, our focus is on
            the small things you reach for every day.
          </p>
        </div>
        <div>
          <h2>Clarity comes first.</h2>
          <p>
            We want product information to be easy to compare, policies easy to
            find, and questions easy to ask. As we prepare to open, we’re
            confirming the details that matter.
          </p>
        </div>
      </div>
      <Link to="/shop" className="button primary">
        Explore the collection <ArrowRight size={17} />
      </Link>
    </div>
  );
}
