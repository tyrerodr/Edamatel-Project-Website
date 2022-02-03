import { Component, OnInit } from '@angular/core';
import { Data } from '@angular/router';
import * as d3 from "d3"; 

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.css']
})
export class PieComponent implements OnInit {
    private data = [
      {"Framework": "Vue", "Stars": "166443", "Released": "2014"},
      {"Framework": "React", "Stars": "150793", "Released": "2013"},
      {"Framework": "Angular", "Stars": "62342", "Released": "2016"},
      {"Framework": "Backbone", "Stars": "27647", "Released": "2010"},
      {"Framework": "Ember", "Stars": "21471", "Released": "2011"},
    ];
    private svg!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private margin = 50;
    private width = 750;
    private height = 600;
    // The radius of the pie chart is half the smallest side
    private radius = Math.min(this.width, this.height) / 2 - this.margin;
    private colors!: d3.ScaleOrdinal<string, unknown, never>;
  constructor() { }

  ngOnInit(): void {
    this.createSvg();
    this.generarData();
  }


  private generarData(){
    fetch('http://localhost:3001/api/articulos')
    .then(texto => texto.json())
    .then(articulos => {
      var file ={};
      var data:any = [];

      let listaCategorias:any = [];
      for(let articulo of articulos) {
        listaCategorias.push(articulo.categoria)
        file = {categoria: articulo.categoria, cantidadStock: articulo.stock};
        data.push(file);
      }

      const miCarritoSinDuplicados = data.reduce((acumulador: { categoria: any; cantidadStock: any; }[], valorActual: { categoria: any; cantidadStock: any; }) => {
        const elementoYaExiste = acumulador.find((elemento: { categoria: any; }) => elemento.categoria === valorActual.categoria);
        if (elementoYaExiste) {
          return acumulador.map((elemento: { categoria: any; cantidadStock: any; }) => {
            if (elemento.categoria === valorActual.categoria) {
              return {
                ...elemento,
                cantidadStock: elemento.cantidadStock + valorActual.cantidadStock
              }
            }
            return elemento;
          });
        }
        return [...acumulador, valorActual];
      }, []);
      
      console.log(miCarritoSinDuplicados);
      data = miCarritoSinDuplicados;

      this.createColors(data);
      this.drawChart(data);    
  });
  }

  private createSvg(): void {
    this.svg = d3.select("figure#pie")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + this.width / 2 + "," + this.height / 2 + ")"
    );
}

private createColors(data: any[]): void{
  this.colors = d3.scaleOrdinal()
  .domain(data.map(d => d.cantidadStock.toString()))
  .range(["#c7d3ec", "#a5b8db", "#879cc4", "#677795", "#5a6782"]);
}

private drawChart(data: any[]): void{
  // Compute the position of each group on the pie:
  const pie = d3.pie<any>().value((d: any) => Number(d.cantidadStock));

  // Build the pie chart
  this.svg
  .selectAll('pieces')
  .data(pie(data))
  .enter()
  .append('path')
  .attr('d', d3.arc<d3.PieArcDatum<Data>>()
  .innerRadius(0)
  .outerRadius(this.radius) 
  )
  .attr('fill', (d:any) => this.colors(d))
  .attr("stroke", "#121926")
  .style("stroke-width", "1px");

  // Add labels
  const labelLocation = d3.arc()
  .innerRadius(100)
  .outerRadius(this.radius);

  this.svg
  .selectAll('pieces')
  .data(pie(data))
  .enter()
  .append('text')
  .text((d:any) => d.data.categoria)
  .attr("transform", (d: any) => "translate(" + labelLocation.centroid(d) + ")")
  .style("text-anchor", "middle")
  .style("font-size", 15);
}

Agregar(producto:any,data:any){
  let repetido=false;
  for(let i=0; i< data.lenght; i++)
  {
    if(data[i].id==producto.id)
    {
      data[i].cantidad++
      repetido=true;
    }
  }
  if(repetido == false)
  {
    data.push(producto);
  }
}

}
