import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'map_screen.dart';

class ConnexionScreen extends StatelessWidget {
  const ConnexionScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Form(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextFormField(
              decoration: InputDecoration(
                hintText: "Email ou Numéro",
                prefixIcon: const Icon(Icons.person, color: Colors.teal,),
                border: OutlineInputBorder(
                  borderSide: const BorderSide(width: 3, color: Colors.blue, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextFormField(
              decoration: InputDecoration(
                hintText: "Mot de passe",
                prefixIcon: const Icon(Icons.lock, color: Colors.teal,),
                suffixIcon: const Icon(Icons.remove_red_eye),
                border: OutlineInputBorder(
                  borderSide: const BorderSide(width: 3, color: Colors.blue, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          ),
          const Text("Mot de passe oublié"),
          const SizedBox(height: 50,),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: ConstrainedBox(
              constraints: BoxConstraints.expand(
                  width: MediaQuery.of(context).size.width,
                  height: 55
              ),
              child: CupertinoButton.filled(
                child: const Text("S'inscrire", textScaleFactor: 1.2,),
                onPressed: (){
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute (
                      builder: (BuildContext context) => const MapScreen(),
                    ),
                  );
                },
              ),
            ),
          ),
/*
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text("Pas encore de compte ?"),
              TextButton(
                onPressed: (){},
                child: const Text("S'inscrire"),
              ),
            ],
          ),
*/

        ],
      ),
    );
  }
}
