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
            child: Card(
              elevation: 10,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
              child: ListTile(
                minLeadingWidth: 0,
                leading: Icon(Icons.notes, color: Theme.of(context).primaryColor),
                title: const CupertinoSearchTextField(
                  itemColor: Colors.teal,
                  backgroundColor: Colors.white,
                ),
              ),
            )
          )
        ],
      ),
        floatingActionButton: Theme(
          data: ThemeData.dark(),
          child: FabCircularMenu(
            ringDiameter: 300,
            fabChild: const Icon(Icons.add),
              ringColor: Colors.teal.withOpacity(0.0),
              fabCloseColor: Colors.teal,
              children: <Widget>[
                FloatingActionButton(
                  backgroundColor: Theme.of(context).primaryColor,
                  onPressed: () {

                  },
                  child: const Icon(Icons.insert_drive_file_outlined, color: Colors.white,),
                ),
                FloatingActionButton(
                  backgroundColor: Theme.of(context).primaryColor,
                  onPressed: () {

                  },
                  child: Image.asset("assets/Vector.png"),
                ),
              ]
          ),
        ),
    );
  }
}
