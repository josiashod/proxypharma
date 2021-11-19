import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:proxy_pharm/inscription1_screen.dart';
import 'package:proxy_pharm/connexion_screen.dart';

class ConnexionHome extends StatefulWidget {
  const ConnexionHome({Key? key}) : super(key: key);

  @override
  _ConnexionHomeState createState() => _ConnexionHomeState();
}

class _ConnexionHomeState extends State<ConnexionHome> {

  bool isSwitch = false;

  List loginScreen =   [
    InscriptionScreen(),
    const ConnexionScreen(),
  ];

  var pageController = PageController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Column(
            children: [
              Image.asset("assets/Untitled.png", fit: BoxFit.cover, height: 170,),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Inscription", textScaleFactor: 1.3,),
                  Switch.adaptive(
                    value: isSwitch,
                    activeColor: Colors.teal,
                    onChanged: (value){
                      pageController.animateToPage(isSwitch ? 0 : 1, duration: Duration(seconds: 1), curve: Curves.ease,);
                      setState(() {
                        isSwitch = value;
                      });
                    },
                  ),
                  const Text("Connexion", textScaleFactor: 1.3,)
                ],
              ),

/*
              SingleChildScrollView(
                child: Column(
                  children: [
                    !isSwitch ? InscriptionScreen() : ConnexionScreen(),
                  ],
                ),
              ),
*/
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: PageView.builder(
                  controller: pageController,
                  itemCount: loginScreen.length,
                  itemBuilder: (context, index){
                    //isSwitch = false;
                    return loginScreen[index];
                  },
                ),
              ),
            ),
            ],
          ),
        ),
      ),
    );
  }
}
