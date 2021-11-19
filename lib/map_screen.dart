import 'package:fab_circular_menu/fab_circular_menu.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({Key? key}) : super(key: key);

  @override
  _MapScreenState createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Center(
            child: FlutterMap(
              options: MapOptions(
                center: LatLng(6.5, 2.09),
                zoom: 12.0,
              ),
              layers: [
                TileLayerOptions(
                  urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                  subdomains: ['a', 'b', 'c'],
                  attributionBuilder: (_) {
                    return const Text("");
                  },
                ),
                MarkerLayerOptions(
                  markers: [
                    Marker(
                      width: 80.0,
                      height: 80.0,
                      point: LatLng(51.5, -0.09),
                      builder: (ctx) =>
                          const FlutterLogo(),
                    ),
                  ],
                ),
              ],

            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 50, left: 10, right: 10),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(30),
              child: Container(
                color: Colors.white,
                child:  const ListTile(
                  trailing: Icon(Icons.menu),
                  title: CupertinoSearchTextField(
                    itemColor: Colors.teal,
                    backgroundColor: Colors.white,
                  ),
                ),
              ),
            )
          )
        ],
      ),
        floatingActionButton: Theme(
          data: ThemeData.dark(),
          child: FabCircularMenu(
            fabChild: Icon(Icons.add),
              ringColor: Colors.teal.withOpacity(0.5),
              fabCloseColor: Colors.teal,
              children: <Widget>[
                IconButton(icon: Icon(Icons.directions), onPressed: () {
                  print('Home');
                }),
                IconButton(icon: Icon(Icons.favorite), onPressed: () {
                  print('Favorite');
                }),
                IconButton(icon: Icon(Icons.directions_bike), onPressed: () {
                  print('Favorite');
                }),
              ]
          ),
        ),
    );
  }
}
