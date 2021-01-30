import React from 'react';
import ReactDOM from 'react-dom';

class PokeCard extends React.Component {

    capitaliseFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    setTypeColours(types) {
        var typeColours = [];
        var typeGradient;
        const MongoClient = require('mongodb').MongoClient;
        const uri = "mongodb+srv://m001-student:m001-mongodb-basics@cluster0.imrmz.mongodb.net/pokedex?retryWrites=true&w=majority";
        const client = new MongoClient(uri, { useNewUrlParser: true });
        client.connect(err => {
            const collection = client.db("pokedex").collection("types");
            types.array.forEach(element => {
               typeColours.push(collection.find({_id:element}, {type:1, _id:0})) 
            });
            console.log("DB COLOURS: " + typeColours)
            if (typeColours.length == 1) {
                typeColours.push(typeColours[0]);
            }
            typeGradient = `linear-gradient(120deg, ${typeColours[0]}, ${typeColours[1]})`;
            client.close();
        });
        return typeGradient;
    }

    render() {
        var pokeName = '';
        var pokeImg;
        var pokeContent = '';
        var pokeColours;
        fetch(this.props.objJson[this.props.index].url)
        .then((resp) => resp.json())
        .then(function(pokeData) {

            //Set Pokemon's name
            if (!!pokeData.species.name) {
                pokeName = pokeData.species.name;
            }
            else {
                pokeName = this.props.objJson[this.props.index].name;
            }
            //h1.textContent = capitaliseFirstLetter(pokeName)
            pokeName = capitaliseFirstLetter(pokeName);

            //Set Pokemon's type
            var types = []
            var prettyTypes = ''
            pokeData.types.forEach(function(t, idx, array) {
                types.push(t.type.name)
                prettyTypes += capitaliseFirstLetter(t.type.name)
                if (idx != array.length - 1) {
                    prettyTypes += ' / '
                }
            })
            //p.textContent = `${prettyTypes}`
            pokeContent = `${prettyTypes}`;

            //Set Pokemon's sprite
            //pImg.src = pokeData.sprites.front_default
            pokeImg = pokeData.sprites.front_default;

            //Set background type colours
            console.log("TYPE COLOURS: " + types)
            //pokeColours = setTypeColours(types);

            //background={pokeColours}
            return (
                <div className="card">
                    <h1 className="pokemon_title" textContent={pokeName}/>
                    <img src={pokeImg}/>
                    <p className="" textContent={pokeContent}/>
                </div>
            );
        })
    }
}

class Pokedex extends React.Component {

    constructor(props) {
        console.log("HERE")
        super(props);
        this.state = {
            request: new Request('https://pokeapi.co/api/v2/pokemon/'),
            count: 0,
            current_page: 1,
            records_per_page: 21,
            objJson: []
        };
    }

    prevPage() {
        if (this.state.current_page > 1) {
            this.state.current_page--;
            changePage(this.state.current_page);
        }
    }
    
    nextPage() {
        if (this.state.current_page < numPages()) {
            this.state.current_page++;
            changePage(this.state.current_page);
        }
    }

    numPages() {
        return Math.ceil(this.state.objJson.length / this.state.records_per_page);
    }

    changePage(page) {
        var btn_next = document.getElementById("btn_next");
        var btn_prev = document.getElementById("btn_prev");
        var page_span = document.getElementById("page");
     
        // Validate page
        if (page < 1) page = 1;
        if (page > numPages()) page = numPages();
    
        //container.innerHTML = "";
    
        // for (var i = (page-1) * this.state.records_per_page; i < (page * this.state.records_per_page) && i < this.state.count; i++) {
        //     const card = document.createElement('div')
        //     card.setAttribute('class', 'card')
        //     const h1 = document.createElement('h1')
        //     h1.className = "pokemon_title"
        //     const p = document.createElement('p')
        //     p.className = ""
        //     const pImg = document.createElement('img')
        
        //     //call card creator -> render of PokeCard
        
        //     // Append the cards to the container element
        //     container.appendChild(card)
        //     card.appendChild(h1)
        //     card.appendChild(pImg)
        //     card.appendChild(p)
        // }
        page_span.innerHTML = page + "/" + numPages();
    
        if (page == 1) {
            btn_prev.style.visibility = "hidden";
        } else {
            btn_prev.style.visibility = "visible";
        }
    
        if (page == numPages()) {
            btn_next.style.visibility = "hidden";
        } else {
            btn_next.style.visibility = "visible";
        }
    }

    request() {
        fetch(this.state.request, {mode: 'cors'}) 
        .then((resp) => resp.json())
        .then(function(data) {

            this.state.count = data.count;
            let pokeUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=' + this.state.count;
            let pokeRequest = new Request(pokeUrl);

            fetch(pokeRequest, {mode: 'cors'})
                .then((resp) => resp.json())
                .then(function(data) {

                this.state.objJson = data.results;
                changePage(1);
            })
            .catch(function(error) {
                console.log(error);
            })
        })
    }

    render() {
        fetch(this.state.request, {mode: 'cors'}) 
        .then((resp) => resp.json())
        .then(function(data) {

            this.state.count = data.count;
            let pokeUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=' + this.state.count;
            let pokeRequest = new Request(pokeUrl);

            fetch(pokeRequest, {mode: 'cors'})
                .then((resp) => resp.json())
                .then(function(data) {

                this.state.objJson = data.results;
                var pokeCards = [];
                for (var i = (page-1) * this.state.records_per_page; i < (page * this.state.records_per_page) && i < this.state.count; i++) {
                pokeCards.push(<PokeCard 
                    index={index}
                    objJson={this.state.objJson}
                />);
                }
                return (
                    <div>
                        <img src="Pokemon_Logo.png"/>
                        <div className="container">{pokeCards}</div>
                    </div>  
                );
            })
            .catch(function(error) {
                console.log(error);
            })
        })
    }
}

ReactDOM.render(
    <Pokedex />,
    document.getElementById('root')
  );