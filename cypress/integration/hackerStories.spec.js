describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Hitting the real API', () => {
  })

  context('Mocking the API', () => {
    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getStories')
      })

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        const stories = require('../fixtures/stories.json')
        it('shows the right data for all rendered stories', () => {
          cy.get('.item')
            .first()
            .should('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
          cy.get(`.item a:contains(${stories.hits[0].title})`)
            .should('have.attr', 'href', stories.hits[0].url)

          cy.get('.item')
            .last()
            .should('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points)
          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        it('shows only one stories after dimissing the first one', () => {
          cy.get('.button-small')
            .first()
            .click()

          cy.get('.item').should('have.length', 1)
        })

        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I test ordering?
        // This is why these tests are being skipped.
        // TODO: Find a way to test them out.
        context('Order by', () => {
          it('orders by title', () => {
            cy.get('.list-header-button:contains(Title)')
              .as('titleHeader') // criação de uma "alias" com o uso do .as
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title)
            cy.get(`.item a:contains(${stories.hits[0].title})`)
              .should('have.attr', 'href', stories.hits[0].url)

            cy.get('@titleHeader') // invocando o "alias" criado
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title)
            cy.get(`.item a:contains(${stories.hits[1].title})`)
              .should('have.attr', 'href', stories.hits[1].url)

            cy.get('@titleHeader')
              .click()
          })

          it('orders by author', () => {
            cy.get('.list-header-button:contains(Author)')
              .as('authorHeader') // criação de uma "alias" com o uso do .as
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].author)

            cy.get('@authorHeader') // invocando o "alias" criado
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].author)
            cy.get('@authorHeader')
              .click()
          })

          it('orders by comments', () => {
            cy.get('.list-header-button:contains(Comments)')
              .as('commentsHeader') // criação de uma "alias" com o uso do .as
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].num_comments)

            cy.get('@commentsHeader') // invocando o "alias" criado
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments)
              
            cy.get('@commentsHeader')
              .click()
          })

          it('orders by points', () => {
            cy.get('.list-header-button:contains(Comments)')
              .as('pointsHeader') // criação de uma "alias" com o uso do .as
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].points)

            cy.get('@pointsHeader') // invocando o "alias" criado
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].points)

            cy.get('@pointsHeader')
              .click()
          })
        })
      })

      it.skip('shows 20 stories, then the next 20 after clicking "More"', () => {
        cy.intercept({
          method: 'GET',
          pathname: '**/search',
          query: {
            query: initialTerm,
            page: '1'
          }
        }).as('getNextStories')

        cy.get('.item').should('have.length', 20)

        cy.contains('More').click()
        cy.wait('@getNextStories')

        cy.get('.item').should('have.length', 40)
      })

      it('searches via the last searched term', () => {
        cy.intercept('GET',
        `**/search?query=${newTerm}&page=0`
        ).as('getNewTermStories')

        cy.get('#search')
          .clear()
          .type(`${newTerm}{enter}`)

        cy.wait('@getNewTermStories')

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
          .click()

        cy.wait('@getStories')

        cy.get('.item').should('have.length', 22)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
        cy.get(`button:contains(${newTerm})`)
          .should('be.visible')
      })

      beforeEach(() => {
        cy.intercept({
          method: 'GET',
          pathname: '**/search',
          query: {
            query: initialTerm,
            page: '0'
          }
        }).as('getStories')

        cy.visit('/')
        cy.wait('@getStories')
      })
    })

    context('Search', () => {
      beforeEach(() => {
        cy.intercept('GET',
         `**/search?query=${initialTerm}&page=0`,
         { fixture: 'emptyStories' }
        ).as('getEmptyStories')

        cy.intercept('GET',
         `**/search?query=${newTerm}&page=0`,
         { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getEmptyStories')

        cy.get('#search')
          .clear()
      })

      it('types and hits ENTER', () => {
        cy.get('#search')
          .type(`${newTerm}{enter}`)

        cy.wait('@getStories')

        cy.get('.item').should('have.length', 2)
        // cy.get('.item')
        //  .first()
        //  .should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .click()

        cy.wait('@getStories')

        cy.get('.item').should('have.length', 2)
        // cy.get('.item')
        //   .first()
        //   .should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')
          cy.intercept(
            'GET', '**/search**',
            { fixture: 'emptyStories' }
          ).as('getRandomWords')

          Cypress._.times(6, () => {
            cy.get('#search')
              .clear()
              .type(`${faker.random.word()}{enter}`)
            cy.wait('@getRandomWords')
          })

          cy.get('.last-searches button')
            .should('have.length', 5)
        })
      })
    })
  })
})

context('Errors', () => {
  it.skip('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { statusCode: 500 }
    ).as('getServerFailure')

    cy.visit('/')
    cy.wait('@getServerFailure')

    cy.get('p:contains(Something went wrong!)')
      .should('be.visible')
  })

  it.skip('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { forceNetworkError: true }
    ).as('getNetworkFailure')

    cy.visit('/')
    cy.wait('@getNetworkFailure')

    cy.get('p:contains(Something went wrong!)')
      .should('be.visible')
  })
})
