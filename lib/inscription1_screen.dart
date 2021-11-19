import 'package:country_code_picker/country_code_picker.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:proxy_pharm/map_screen.dart';

class InscriptionScreen extends StatelessWidget {

  String countryCode = "+229";

  InscriptionScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Form(
      child: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextFormField(
                decoration: InputDecoration(
                  hintText: "Nom",
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
                  hintText: "Prenom",
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
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  hintText: "Téléphone",
                  prefixIcon: CountryCodePicker(
                    onChanged: (value){
                      countryCode = value.code!;
                    },
                    // Initial selection and favorite can be one of code ('IT') OR dial_code('+39')
                    initialSelection: 'BJ',
                    favorite: const ['BJ','FR'],
                    // optional. Shows only country name and flag
                    showCountryOnly: false,
                    // optional. Shows only country name and flag when popup is closed.
                    showOnlyCountryWhenClosed: false,
                    // optional. aligns the flag and the Text left
                    alignLeft: false,
                  ),
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
                  hintText: "Adresse",
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
                  suffixIcon: const Icon(Icons.remove_red_eye),
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
                  suffixIcon: const Icon(Icons.remove_red_eye),
                  border: OutlineInputBorder(
                    borderSide: const BorderSide(width: 3, color: Colors.blue, style: BorderStyle.solid),
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
            ),
            //const SizedBox(height: 50,),
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
                const Text("Vous avez un compte ?"),
                TextButton(
                  onPressed: (){},
                  child: const Text("Se connecter"),
                ),
              ],
            ),
*/
          ],
        ),
      ),
    );
  }
}
