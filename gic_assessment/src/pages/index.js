import { Link } from "react-router";
import "./index.css";

function Home() {
  return (
    <div>
      <header className="App-header">
        <div className="Option">
          <img src="https://static.vecteezy.com/system/resources/previews/055/229/870/non_2x/cute-cafe-illustration-with-cozy-details-vector.jpg" alt="Cafe" width="400em"/>
          <Link
          className="App-link"
          to="/cafes">Cafe</Link>
        </div>

        <div className="Option">
          <img src="https://media.istockphoto.com/id/1496419462/vector/young-caucasian-waitress-holding-a-tray-with-two-cups-of-tea-or-coffee-and-a-glass-of-water.jpg?s=612x612&w=0&k=20&c=QQHbiRaSXvOcO4ncVYtuWilOa3_YLje6TI7vShCjg4Q=" alt="Barista" width="400em"/>
          <Link
          className='App-link'
          to="/employees">Employee</Link>
        </div>
      </header>
    </div>
  );
}

export default Home;
