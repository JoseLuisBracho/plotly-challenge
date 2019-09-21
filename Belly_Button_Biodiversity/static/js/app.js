function buildMetadata(sample) {
// Use d3.json to fetch the metadata for a sample
  // Use d3 to select the panel with id of #sample-metadata
  var sample_metadata_panel = d3.select("#sample-metadata");

  // Use `.html("") to clear any existing metadata
  sample_metadata_panel.html("");

  var metadata_url = `/metadata/${sample}`;
  console.log(metadata_url);

  // Use Object.entries to add each key and value pair to the panel
  // Hint: Inside the loop, you will need to use d3 to append new
  // tags for each key-value in the metadata.
 
  d3.json(metadata_url).then(function(metadata_sample){
    panel_list = Object.entries(metadata_sample);
    console.log(panel_list);
    panel_list.forEach((item => {
      sample_metadata_panel.append("p")
        .text(item[0]+ " : "+ item[1]);
    }))

  // BONUS: Build the Gauge Chart
  // buildGauge(data.WFREQ);
  var wFreq = panel_list[5][1];
  console.log(`Washing frequency: ${wFreq}`);

  d3.select("#gauge").html("");
 
  var traceGauge = {
    type: "pie",
    showlegend: false,
    hole: 0.4,
    rotation: 90,
    values: [100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100],
    text: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", ""],
    direction: "clockwise",
    textinfo: "text",
    textposition: "inside",
    marker: {
      colors: ["rgba(204, 255, 204, 0.6)", "rgba(153, 255, 153, 0.6)", "rgba(102, 255, 102, 0.6)",
                "rgba(51, 255, 51, 0.6)", "rgba(0, 255, 0, 0.6)", "rgba(0, 204, 0, 0.6)",
                "rgba(0, 153, 0, 0.6)", "rgba(0, 102, 0, 0.6)", "rgba(0, 51, 0, 0.6)", "white"]
    },
    labels: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", "null"],
    hoverinfo: "label"
  };

  var degrees = wFreq*20;
  radius = 0.2;
  var radians = degrees * Math.PI / 180;
  var x = -1*radius * Math.cos(radians) + 0.5;
  var y = radius * Math.sin(radians) + 0.5;

  console.log(`x value: ${x}`);
  console.log(`y value: ${y}`);

  var layout = {
    shapes:[{
        type: 'line',
        x0: 0.5,
        y0: 0.5,
        x1: x,
        y1: y,
        line: {
          color: 'black',
          width: 4
        }
      }],
    title: 'Belly Button Washing Frequency (Scrubs per week)',
    xaxis: {visible: false, range: [-1, 1]},
    yaxis: {visible: false, range: [-1, 1]}
  };
  
  var data = [traceGauge];
  console.log(`Data for gauge chart: ${data}`);
  
  Plotly.newPlot("gauge", data, layout, {staticPlot: true});

  })
}

function buildCharts(sample) {
  // @TODO: Use d3.json to fetch the sample data for the plots
    var sample_pie = d3.select("#pie").html("");
    var sample_pie_url = `/samples/${sample}`;
    d3.json(sample_pie_url).then((muestra => {
      console.log(muestra);
      
      // Order by otu_ids
      muestra.sample_values.sort((n1, n2) => n2 - n1);
      var threshold = muestra.sample_values.slice(9, 10);
      console.log(`Threshold value: ${threshold}`);
      
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
      new_sample_values = [];
      new_otu_ids = [];
      new_otu_labels = [];

      for (let i = 0; i<muestra.sample_values.length; i++) {
        if (muestra.sample_values[i] >= threshold) {
          new_sample_values.push(muestra.sample_values[i]);
          new_otu_ids.push(muestra.otu_ids[i]);
          new_otu_labels.push(muestra.otu_labels[i]);
          console.log(new_otu_ids[i]);
        }
      };
      
    // @TODO: Build a Pie Chart
    var tracePie = {
      labels: new_otu_ids,
      values: new_sample_values,
      type: 'pie',
      hovertext: new_otu_labels,
      hoverinfo: 'hovertext'
    };

    var dataPie = [tracePie];

    layout = {
      heigth: 500,
      width: 500
    }

    Plotly.newPlot("pie", dataPie, layout);

    // @TODO: Build a Bubble Chart using the sample data
    d3.select("#bubble").html("");

    var traceBubble = {
      type: "scatter",
      mode: "markers",
      x: muestra.otu_ids,
      y: muestra.sample_values,
      text: muestra.otu_labels,
        marker: {
          color: muestra.otu_ids,
          colorscale: "Rainbow",
          size: muestra.sample_values,
          text: muestra.otu_labels
        }

    };

    var dataBubble = [traceBubble];

    var layout = {
      sizemode: "area",
      hovermode:"closet",
      xaxis: {
        title: "otu_ids",
      },
      showlegend: false
    }

    Plotly.newPlot('bubble', dataBubble, layout);

    }))

}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}
function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}
// Initialize the dashboard
init();
