# Annotated News Extension
This Google Chrome Extension was developed in order to facilitate a controlled social sciences experiment. While the tool was designed with a specific use case in mind, the result is a broad and expansible platform for annotating online content. With modifications, this software can be used in other experiments or in a product.

# Testing and Deployment
To test the extension, upload the entire directory to Chrome as an "unpacked extension" then interact with the tool.

## Design Discussion
The extension has multiple layers of communication and interaction.

*manifest.json* is required by all Chrome extensions and contains information for permissions and resources.

*background.js* is a "service-worker" that runs behind the scenes and can be thought of as the controller between the various layers of the extension, the browser, and a visited site. Background.js also handles all the interactions with the server.

*./content* includes content scripts that are added to a visited site once the extension is activated. These files live in isolated worlds and so each serve a dedicated purpose.
*active.js* includes the logic for interacting with annotations, popups, and the iframe toolbar
*modify.js* includes the logic for adding the toolbar, adding the popups, and linking key text to annotations


*/frame* includes the html, js, and css for a seperate <iframe> that is injected into the DOM of a visited site. This is the toolbar that a user interacts with the view annotation material.

*/popup* includes the html for the popup window that appears when the extension's icon is clicked in the top of the browser near the search bar.

*messaging* allows for the background service worker to communicate with the content scripts, the popup window, and the injected html frame.

## Annotation Types
There are two types of annotations: context and counterpoint. Context annotations appear as popups and counterpoint annotations appear in longer form from a window that slides up from the bottom of the page. We calls these popups and panels.

Context Annotations generally consist of:
1. type = content
2. unique-id   "unique-id": "an-123456",
3. key-text
4. preview
5. title
6. text
7. a list of content [content types]

Counterpoint Annotations generally consist of:
1. type = "counterpoint"
2. unique-id
3. key-text
4. preview
5. title
6. text
7. a list of perspectives [content types w/ added perspective field]

The supported content-types are:
1. links
2. quotes
3. files
4. file quotes

Links have:
1. content-type = "link"
2. source
3. perspective (if in a panel/"Counterpoint")
4. text
5. url

Quotes have:
1. content-type = "quote"
2. source
3. perspective
4. text
5. url

Files have:
1. content-type = "file"
2. source
3. perspective
4. text
5. path

File-Quote have:
1. content-type = "file-quote"
2. source
3. perspective
4. text
5. path

All annotations have "key text" that is a "quote" from the article or content of the visited website. The modification content script, modify.js, handles linking this key text with the inserted panel or popup. Panels are added through the iframe toolbar, so modify.js sends a message to the iframe to handle adding this data to the DOM of the visited site.

## Server Backend
In order to use the full functionality of the tool, you will need to deploy a web server that can service the extension by providing data and keeping records of a user's interaction with the tool. This is done through HTTP GET and POST requests to url endpoints on your server. All communication with the server is conducted through background.js. Generally speaking, a visited websites url is the key through which annotation data is selected and served. An expanded backend could take the HTML contents of a visited page, perform some analysis on it, and return a JSON file of the annotation data.

## Expected Data Format
Incoming annotation data from the server must comply with the following example formatting. Obviously, additional fields can be added, but the corresponding code must be written in modify.js to inside these fields into the actual HTML of a popup or panel.

*note* "key-text" of "__ABS__" is absolutely positioned on the visited site. The offset from the top of the page is specified in the "ABS_offset" field. This is a pixel measurement from the top of the visited page.

```
{
  "meta-data": {
    "file": "news_right_active.JSON",
    "type": "article",
    "orientation": "right",
    "study-group": "active",
    "url": "https://www.breitbart.com/politics/2020/12/17/fraud-happened-sen-rand-paul-says-the-election-in-many-ways-was-stolen/",
    "source": "Breitbart",
    "title": "‘Fraud Happened’: Sen. Rand Paul Says the Election in ‘Many Ways Was Stolen’"
  },

  "annotations": [
    {
      "type": "context",
      "unique-id": "an-123456",
      "key-text": "__ABS__",
      "ABS_offset": "0",
      "preview": "What is Breitbart?",
      "title": "Source Analysis",
      "text": "",
      "content": [
        {
          "content-type": "quote",
          "source": "AllSides",
          "text": "Breitbart News Network is a politically conservative American news and opinion website headquartered in Los Angeles, California, with additional bureaus in Texas, London and Jerusalem.",
          "url": "https://www.allsides.com/news-source/breitbart"
        }
      ]
    },
    {
      "type": "context",
      "unique-id": "an-123458",
      "key-text": "Sen. Rand Paul (R-KY)",
      "preview": "Who is Hayley Miller?",
      "title": "Key Figure Analysis",
      "text": "",
      "content": [
        {
          "content-type": "quote",
          "source": "Wikipedia",
          "text": "Randal Howard Paul (born January 7, 1963) is an American physician and politician serving as the junior United States Senator from Kentucky since 2011. He is the son of former three-time presidential candidate and twelve-term U.S. Representative of Texas, Ron Paul.",
          "url": "https://en.wikipedia.org/wiki/Rand_Paul"
        }
      ]
    },
    {
      "type": "counterpoint",
      "unique-id": "an-123459",
      "key-text": "Probably two dozen states decided to accept ballots after the election. Two dozen states decided they could mail out applications or mail out ballots, all without the will of the legislature",
      "preview": "Explore what other experts and politicians think about this claim…",
      "title": "Legality of Election Rule Changes",
      "text": "At Question: Can election rules be changed (i.e. \"mail out applications or mail out ballots\") without the will of the legislature?",
      "perspectives": [
        {
          "content-type": "link",
          "source": "Ballotpedia",
          "perspective": "Details about Rule Changes",
          "text": "List of Election Rule changes in each state and relevent litigation:",
          "url": "https://ballotpedia.org/Changes_to_election_dates,_procedures,_and_administration_in_response_to_the_coronavirus_(COVID-19)_pandemic,_2020#Absentee.2Fmail-in_voting_procedure_modifications_for_the_general_election"
        },
        {
          "content-type": "quote",
          "source": "Constitution Center",
          "perspective": "State Governments play a massive role in determining election rules:",
          "text": "By making the term \"legislature\" dependent upon the lawmaking procedures recognized by state law instead of fixed within the text of the Elections Clause, the state, through its legislature and its citizens, retains a default role in determining how and through which body it wants to implement the \"Times, Places and Manner\" of federal elections. As the constitutional text and history show, the Elections Clause provides a unique organizational structure that gives the states broad power to construct federal elections, but it ultimately delegates final policymaking authority to Congress.",
          "url": "https://constitutioncenter.org/interactive-constitution/interpretation/article-i/clauses/750#ordering-state-federal-relations-through-the-elections-clause-tolson"
        },
        {
          "content-type": "quote",
          "source": "NY Times",
          "perspective": "There is some legitimacy to the question of improper election rule changes in Pennsylvania:",
          "text": "In a pair of decisions welcomed by Democrats, the Supreme Court on Wednesday let election officials in two key battleground states, Pennsylvania and North Carolina, accept absentee ballots for several days after Election Day. In the Pennsylvania case, the court refused a plea from Republicans in the state that it decide before Election Day whether election officials can continue receiving absentee ballots for three days after Nov. 3. In the North Carolina case, the court let stand lower court rulings that allowed the state’s board of elections to extend the deadline to nine days after Election Day, up from the three days called for by the state legislature.",
          "url": "https://www.nytimes.com/2020/10/28/us/supreme-court-pennsylvania-north-carolina-absentee-ballots.html"
        },
        {
          "content-type": "quote",
          "source": "Tampa Bay News",
          "perspective": "One example of litigation regarding election rule changes in Pennsylvania",
          "text": "In October 2019, the Republican-led Pennsylvania General Assembly passed an election law, Act 77, that added no-excuse voting by mail, a provision pushed by Democrats. The act says that any qualified elector who is not eligible to be an absentee elector can get a mail-in ballot. Act 77 required constitutional challenges be brought within 180 days, but that didn’t happen. After Trump lost the Nov. 3 election, U.S. Rep. Mike Kelly, R-Pa., and co-plaintiffs filed a case against state officials arguing that the mail-in ballot provisions in Act 77 were a violation. One week later, the state Supreme Court dismissed the petition as untimely, writing that the plaintiffs filed their case more than a year after Act 77 was enacted and after millions of residents had already voted in the primary and general elections. The case was filed as the final ballots \"were being tallied, with the results becoming seemingly apparent,\" the court wrote. The court’s three-page order did not address whether Act 77 and the state constitution were in conflict. After losing, Kelly took the case to the U.S. Supreme Court, where an emergency application for injunctive relief was denied by Justice Samuel Alito Dec. 8.",
          "url": "https://www.tampabay.com/news/florida-politics/2021/01/09/fact-checking-josh-hawleys-claim-about-pennsylvanias-election-law-politfact/"
        },
        {
          "content-type": "file-quote",
          "source": "Supreme Court",
          "perspective": "In reference to the Pennsylvania case mentioned left, Justice Alito wrote:",
          "text": "It would be highly desirable to issue a ruling on the constitutionality of the State Supreme Court’s decision before the election. That question has national importance, and there is a strong likelihood that the State Supreme Court decision violates the Federal Constitution. The provisions of the Federal Constitution conferring on state legislatures, not state courts, the authority to make rules governing federal elections would be meaningless if a state court could override the rules adopted by the legislature simply by claiming that a state constitutional provision gave the courts the authority to make whatever rules it thought appropriate for the conduct of a fair election.",
          "path": "../src/AN_SOURCE/R_ARTICLE_SOURCE1.pdf"
        }
      ]
    },
```

## Development Notes
Uses:  popper.js to position "pop-up" context windows.
https://popper.js.org/docs/v2/

Uses: findAndReplaceDOMText.js
https://github.com/padolsey/findAndReplaceDOMText
